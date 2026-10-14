const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Helper for HTTP requests with automatic retry for server cold-starts (503 / 502 / network sleep)
async function fetchAPI(endpoint, options = {}, retries = 2) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      if ((res.status === 503 || res.status === 502) && retries > 0) {
        // Backend service is cold starting on Render: wait 2.5s and retry
        await new Promise((r) => setTimeout(r, 2500));
        return await fetchAPI(endpoint, options, retries - 1);
      }
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `API error: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    if (retries > 0 && (err.message.includes("Failed to fetch") || err.message.includes("NetworkError"))) {
      await new Promise((r) => setTimeout(r, 2500));
      return await fetchAPI(endpoint, options, retries - 1);
    }
    console.warn(`[API Call Failed: ${endpoint}]`, err.message);
    throw err;
  }
}

// User Services
export async function createUser({
  name,
  field_of_work,
  faculty,
  department,
  institution,
  training_type = "siwes",
  log_length_lines = "2-3",
  grammar_level = "balanced",
  use_nigerian_lingo = true,
  is_onboarded = false,
}) {
  try {
    return await fetchAPI("/api/users", {
      method: "POST",
      body: JSON.stringify({
        name,
        field_of_work,
        faculty,
        department,
        institution,
        training_type,
        log_length_lines,
        grammar_level,
        use_nigerian_lingo,
        is_onboarded,
      }),
    });
  } catch (e) {
    // Local fallback for offline/development mode
    const mockUuid = "demo-" + Math.random().toString(36).substring(2, 9);
    const mockUser = {
      id: mockUuid,
      name: name || "SIWES Student",
      field_of_work: field_of_work || "General Fieldwork",
      faculty: faculty || "Faculty of Technology",
      department: department || "Mechanical Engineering",
      institution: institution || "University of Technology",
      training_type: training_type || "siwes",
      log_length_lines: log_length_lines || "2-3",
      grammar_level: grammar_level || "balanced",
      use_nigerian_lingo: use_nigerian_lingo ?? true,
      is_onboarded: is_onboarded,
      custom_prompt: `Focus on daily technical tasks, equipment calibrated, and challenges faced.`,
      created_at: new Date().toISOString(),
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(`yarn_user_${mockUuid}`, JSON.stringify(mockUser));
    }
    return mockUser;
  }
}

export async function getUserProfile(uuid) {
  try {
    return await fetchAPI(`/api/users/${uuid}`);
  } catch (e) {
    if (typeof window !== "undefined") {
      const local = localStorage.getItem(`yarn_user_${uuid}`);
      if (local) return JSON.parse(local);
    }
    return {
      id: uuid,
      name: "Chidi Okafor",
      field_of_work: "Agricultural Engineering - Thermal Imaging",
      faculty: "Faculty of Agriculture",
      department: "Agricultural Economics",
      institution: "FUTA",
      training_type: "siwes",
      log_length_lines: "2-3",
      grammar_level: "balanced",
      use_nigerian_lingo: true,
      is_onboarded: true,
      custom_prompt: "Focus on crop temperatures, ambient humidity, equipment setup.",
      created_at: new Date().toISOString(),
    };
  }
}

export async function updateUserProfile(uuid, data) {
  try {
    return await fetchAPI(`/api/users/${uuid}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  } catch (e) {
    if (typeof window !== "undefined") {
      const existing = await getUserProfile(uuid);
      const updated = { ...existing, ...data };
      localStorage.setItem(`yarn_user_${uuid}`, JSON.stringify(updated));
      return updated;
    }
    return data;
  }
}

// Logbook Services
export async function getUserLogs(userUuid, options = {}) {
  const { start_date, end_date, include_deleted, only_deleted } = options;
  const params = new URLSearchParams();
  if (start_date) params.append("start_date", start_date);
  if (end_date) params.append("end_date", end_date);
  if (include_deleted) params.append("include_deleted", "true");
  if (only_deleted) params.append("only_deleted", "true");

  const query = params.toString() ? `?${params.toString()}` : "";
  try {
    return await fetchAPI(`/api/logs/${userUuid}${query}`);
  } catch (e) {
    // Return sample logs for demo/preview
    return [
      {
        id: "log-1",
        user_id: userUuid,
        date: new Date().toISOString().split("T")[0],
        raw_transcript: "Today I visited the cassava plantation, calibrated the infrared FLIR thermal camera, measured canopy temperature at 9:00 AM...",
        processed_output: `### Date & Location\n**Date:** ${new Date().toISOString().split("T")[0]}\n**Location:** Research Orchard, Block B\n\n### Activities Performed\n- Calibrated the FLIR E8-XT infrared thermal imaging camera.\n- Conducted canopy temperature measurements across 20 cassava sample trees.\n\n### Tools & Equipment Used\n- FLIR E8-XT Camera\n- Digital Hygrometer\n\n### Challenges & Learnings\n- High midday sun glare affected thermal readings between 12:00 PM and 1:30 PM.\n\n### Next Steps / Remarks\n- Schedule early morning measurements tomorrow at 7:30 AM.`,
        is_confidential: false,
        created_at: new Date().toISOString(),
      },
    ];
  }
}

export async function getSingleLog(logId, include_deleted = false) {
  try {
    const query = include_deleted ? "?include_deleted=true" : "";
    return await fetchAPI(`/api/logs/single/${logId}${query}`);
  } catch (e) {
    return {
      id: logId,
      date: new Date().toISOString().split("T")[0],
      raw_transcript: "Recorded thermal readings using the FLIR camera...",
      processed_output: `### Date & Location\n**Date:** ${new Date().toISOString().split("T")[0]}\n**Location:** Site Workshop\n\n### Activities Performed\n- Inspected irrigation equipment and recorded leaf water potential.\n\n### Tools & Equipment Used\n- Porometer, FLIR Camera\n\n### Challenges & Learnings\n- Battery drainage on thermal imaging camera.\n\n### Next Steps / Remarks\n- Recharge thermal camera overnight.`,
      is_confidential: false,
    };
  }
}

export async function createLog(logData) {
  try {
    return await fetchAPI("/api/logs", {
      method: "POST",
      body: JSON.stringify(logData),
    });
  } catch (e) {
    return { id: "log-" + Date.now(), ...logData, created_at: new Date().toISOString() };
  }
}

export async function deleteLog(logId, hard_delete = false) {
  try {
    const query = hard_delete ? "?hard_delete=true" : "";
    return await fetchAPI(`/api/logs/${logId}${query}`, { method: "DELETE" });
  } catch (e) {
    return { success: true };
  }
}

export async function restoreLog(logId) {
  try {
    return await fetchAPI(`/api/logs/${logId}/restore`, { method: "POST" });
  } catch (e) {
    return { success: true };
  }
}

// Voice Processing AI Service
export async function processVoiceInput({
  user_uuid,
  transcript,
  audio_file,
  use_own_key = false,
  training_type,
  log_length_lines,
  grammar_level,
  use_nigerian_lingo,
}) {
  try {
    if (audio_file) {
      const formData = new FormData();
      formData.append("user_uuid", user_uuid);
      formData.append("audio_file", audio_file);
      formData.append("use_own_key", String(use_own_key));
      if (training_type) formData.append("training_type", training_type);
      if (log_length_lines) formData.append("log_length_lines", log_length_lines);
      if (grammar_level) formData.append("grammar_level", grammar_level);
      if (use_nigerian_lingo !== undefined) formData.append("use_nigerian_lingo", String(use_nigerian_lingo));

      const res = await fetch(`${API_BASE_URL}/api/process-voice`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Audio processing failed: ${res.status}`);
      }
      return await res.json();
    } else {
      return await fetchAPI("/api/process-voice", {
        method: "POST",
        body: JSON.stringify({
          user_uuid,
          transcript,
          use_own_key,
          training_type,
          log_length_lines,
          grammar_level,
          use_nigerian_lingo,
        }),
      });
    }
  } catch (e) {
    // Simulated AI logbook transformation for preview / offline demo
    await new Promise((r) => setTimeout(r, 1200));
    const program = (training_type || "siwes").toLowerCase();

    let sampleOutput = "";
    if (program === "swep") {
      sampleOutput = `• I attended the workshop safety briefing and we collected our mild steel stock from the store.\n• I operated the manual lathe to turn the workpiece down to 25mm diameter.\n• We checked the finished dimensions against tolerance specs using a vernier caliper.`;
    } else if (program === "it") {
      sampleOutput = `• I inspected the primary chiller condenser circuit and we recorded operating pressure differentials.\n• We resolved the fluid flow restriction and I logged the baseline metrics in the handover register.`;
    } else {
      // SIWES default (2-3 lines)
      sampleOutput = `• I assisted the senior technician with scheduled maintenance checks on the primary pump unit.\n• We logged operating suction pressures and I completed the lubricating oil top-up.`;
    }

    return {
      processed_text: sampleOutput,
      tokens_used: 120,
    };
  }
}

// Vocabulary Services
export async function getUserVocabulary(userUuid) {
  try {
    return await fetchAPI(`/api/vocabulary/${userUuid}`);
  } catch (e) {
    return [
      { id: "v1", term: "FLIR E8-XT", context: "Thermal Camera" },
      { id: "v2", term: "CWSI", context: "Crop Water Stress Index" },
      { id: "v3", term: "Stomatal Conductance", context: "Leaf Measurement" },
    ];
  }
}

export async function addVocabularyTerm({ user_id, term, context }) {
  try {
    return await fetchAPI("/api/vocabulary", {
      method: "POST",
      body: JSON.stringify({ user_id, term, context }),
    });
  } catch (e) {
    return { id: "vocab-" + Date.now(), user_id, term, context };
  }
}

export async function deleteVocabularyTerm(id) {
  try {
    return await fetchAPI(`/api/vocabulary/${id}`, { method: "DELETE" });
  } catch (e) {
    return { success: true };
  }
}
