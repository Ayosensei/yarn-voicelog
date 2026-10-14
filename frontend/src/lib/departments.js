/**
 * Nigerian University Faculties & Departments.
 * Standard across SWEP, SIWES, and IT programs.
 */

export const FACULTIES_AND_DEPARTMENTS = [
  {
    faculty: "Faculty of Agriculture",
    departments: [
      "Agricultural Economics",
      "Agricultural Extension and Rural Development",
      "Animal Science",
      "Crop Production and Protection",
      "Food and Nutrition",
      "Soil Production Management",
    ],
  },
  {
    faculty: "Faculty of Arts",
    departments: [
      "Linguistics",
      "Music",
    ],
  },
  {
    faculty: "Faculty of Environmental Design and Management (EDM)",
    departments: [
      "Architecture",
      "Building",
      "Estate Management",
      "Fine and Applied Arts",
      "Quantity Surveying",
      "Surveying and Geoinformatics",
      "Urban and Regional Planning",
    ],
  },
  {
    faculty: "Faculty of Science",
    departments: [
      "Biochemistry",
      "Industrial Chemistry",
      "Microbiology",
    ],
  },
  {
    faculty: "Faculty of Social Sciences",
    departments: [
      "Entrepreneurship Studies",
      "Sociology and Anthropology",
    ],
  },
  {
    faculty: "Faculty of Technology",
    departments: [
      "Aerospace Engineering",
      "Agricultural and Environmental Engineering",
      "Chemical Engineering",
      "Civil Engineering",
      "Computer Science and Engineering",
      "Electrical and Electronic Engineering",
      "Food Science and Technology",
      "Materials Science and Engineering",
      "Mechanical Engineering",
    ],
  },
];

export const ALL_FACULTIES = FACULTIES_AND_DEPARTMENTS.map((f) => f.faculty);

export function getDepartmentsForFaculty(facultyName) {
  const match = FACULTIES_AND_DEPARTMENTS.find((f) => f.faculty === facultyName);
  return match ? match.departments : [];
}

export function findFacultyForDepartment(deptName) {
  if (!deptName) return "";
  for (const group of FACULTIES_AND_DEPARTMENTS) {
    if (group.departments.includes(deptName)) {
      return group.faculty;
    }
  }
  return "";
}
