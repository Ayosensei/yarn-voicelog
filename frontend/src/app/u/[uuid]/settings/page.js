"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import Chip from "@/components/Chip";
import Toast from "@/components/Toast";
import { getUserProfile, updateUserProfile, getUserVocabulary, addVocabularyTerm, deleteVocabularyTerm } from "@/lib/api";
import { Save, Plus, KeyRound, BookOpen, PenLine, User, Eye, EyeOff } from "lucide-react";

export default function SettingsPage() {
  const params = useParams();
  const userUuid = params.uuid;

  const [profile, setProfile] = useState({ name: "", field_of_work: "", custom_prompt: "" });
  const [vocabulary, setVocabulary] = useState([]);
  const [newTerm, setNewTerm] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const [profData, vocabData] = await Promise.all([
          getUserProfile(userUuid),
          getUserVocabulary(userUuid),
        ]);
        setProfile(profData || {});
        setVocabulary(vocabData || []);
      } catch (err) {
        console.error("Settings load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [userUuid]);

  // Handle Adding Vocabulary Term
  const handleAddTerm = async (e) => {
    e.preventDefault();
    if (!newTerm.trim()) return;

    try {
      const added = await addVocabularyTerm({
        user_id: userUuid,
        term: newTerm.trim(),
        context: profile.field_of_work,
      });
      setVocabulary((prev) => [...prev, added]);
      setNewTerm("");
      setToastMessage(`Term "${added.term}" added.`);
    } catch (err) {
      setToastMessage("Could not add term.");
    }
  };

  // Handle Removing Vocabulary Term
  const handleRemoveTerm = async (id) => {
    try {
      await deleteVocabularyTerm(id);
      setVocabulary((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      setToastMessage("Could not remove term.");
    }
  };

  // Save Settings
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateUserProfile(userUuid, {
        name: profile.name,
        field_of_work: profile.field_of_work,
        custom_prompt: profile.custom_prompt,
        api_key: apiKey ? apiKey.trim() : undefined,
      });
      setToastMessage("Settings updated successfully!");
    } catch (err) {
      setToastMessage("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar userUuid={userUuid} title="Settings" />
        <main className="content-column">
          <div className="yarn-card skeleton-shimmer" style={{ height: "400px" }} />
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar userUuid={userUuid} title="Settings" />

      <main className="content-column">
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "var(--s-6)" }}>
          {/* Section 1: User Profile */}
          <div className="yarn-card" style={styles.cardSection}>
            <div style={styles.sectionHeader}>
              <User size={20} color="var(--accent-600)" />
              <h2 className="heading-text">Student Profile</h2>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Name</label>
              <input
                type="text"
                className="yarn-input"
                value={profile.name || ""}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Field of Work / Study</label>
              <input
                type="text"
                className="yarn-input"
                placeholder="e.g. Agricultural Engineering"
                value={profile.field_of_work || ""}
                onChange={(e) => setProfile({ ...profile, field_of_work: e.target.value })}
              />
            </div>
          </div>

          {/* Section 2: Custom Writing Guidelines / Prompt */}
          <div className="yarn-card" style={styles.cardSection}>
            <div style={styles.sectionHeader}>
              <PenLine size={20} color="var(--accent-600)" />
              <h2 className="heading-text">Logbook Writing Style</h2>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Custom Prompt Guidelines</label>
              <textarea
                className="yarn-textarea"
                placeholder="e.g. Always focus on experimental setup, ambient temperature, and equipment calibration."
                value={profile.custom_prompt || ""}
                onChange={(e) => setProfile({ ...profile, custom_prompt: e.target.value })}
              />
              <span className="caption-text" style={{ color: "var(--ink-600)" }}>
                Yarn injects these guidelines whenever generating your structured log entry.
              </span>
            </div>
          </div>

          {/* Section 3: Technical Vocabulary Tag Manager */}
          <div className="yarn-card" style={styles.cardSection}>
            <div style={styles.sectionHeader}>
              <BookOpen size={20} color="var(--accent-600)" />
              <h2 className="heading-text">Custom Technical Vocabulary</h2>
            </div>

            <div style={styles.fieldGroup}>
              <span className="small-text" style={{ color: "var(--ink-600)" }}>
                Preserve specific technical jargon, tools, or abbreviations exactly as spoken:
              </span>

              {/* Vocabulary Chips Row */}
              <div style={styles.vocabChipsContainer}>
                {vocabulary.length > 0 ? (
                  vocabulary.map((item) => (
                    <Chip
                      key={item.id}
                      label={item.term}
                      variant="vocab"
                      onRemove={() => handleRemoveTerm(item.id)}
                    />
                  ))
                ) : (
                  <span className="caption-text" style={{ color: "var(--ink-400)" }}>
                    No terms added yet. Add your first technical term below.
                  </span>
                )}
              </div>

              {/* Add New Term Input */}
              <div style={styles.addTermRow}>
                <input
                  type="text"
                  className="yarn-input"
                  placeholder="e.g. FLIR E8-XT, CWSI"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  style={{ flex: 1, height: "40px" }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="S"
                  leadingIcon={Plus}
                  onClick={handleAddTerm}
                >
                  Add term
                </Button>
              </div>
            </div>
          </div>

          {/* Section 4: BYOK Gemini Key Input */}
          <div className="yarn-card" style={styles.cardSection}>
            <div style={styles.sectionHeader}>
              <KeyRound size={20} color="var(--accent-600)" />
              <h2 className="heading-text">Bring Your Own Key (BYOK)</h2>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Custom Gemini API Key</label>
              <div style={styles.apiKeyWrapper}>
                <input
                  type={showApiKey ? "text" : "password"}
                  className="yarn-input"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  style={{ paddingRight: "48px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  style={styles.eyeBtn}
                  className="clickable"
                >
                  {showApiKey ? <EyeOff size={20} color="var(--ink-600)" /> : <Eye size={20} color="var(--ink-600)" />}
                </button>
              </div>
              <span className="caption-text" style={{ color: "var(--ink-600)" }}>
                Optional. Keys are encrypted with Fernet before storing. Provides unlimited daily generation.
              </span>
            </div>
          </div>

          <Button type="submit" variant="primary" size="L" fullWidth isLoading={saving} leadingIcon={Save}>
            Save changes
          </Button>
        </form>
      </main>

      <Toast message={toastMessage} isOpen={!!toastMessage} onClose={() => setToastMessage("")} />
    </>
  );
}

const styles = {
  cardSection: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--s-4)",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    paddingBottom: "8px",
    borderBottom: "1px solid var(--border)",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--s-2)",
  },
  label: {
    fontSize: "14px",
    fontWeight: 500,
    color: "var(--ink-900)",
  },
  vocabChipsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    padding: "8px 0",
  },
  addTermRow: {
    display: "flex",
    alignItems: "center",
    gap: "var(--s-2)",
    marginTop: "4px",
  },
  apiKeyWrapper: {
    position: "relative",
    width: "100%",
  },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
  },
};
