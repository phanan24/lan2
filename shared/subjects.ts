// Subject configurations for different AI models

export const ALL_SUBJECTS = [
  "Toán",
  "Ngữ văn", 
  "Địa lí",
  "Giáo dục Kinh tế và Pháp luật",
  "Vật lí",
  "Hóa học", 
  "Sinh học",
  "Công nghệ",
  "Tin học"
];

export const DEEPSEEK_ALLOWED_SUBJECTS = [
  "Toán",
  "Vật lí",
  "Hóa học",
  "Sinh học", 
  "Công nghệ",
  "Tin học"
];

export const GPT_ONLY_SUBJECTS = [
  "Ngữ văn",
  "Địa lí", 
  "Giáo dục Kinh tế và Pháp luật"
];

export function getAvailableSubjects(useGpt5: boolean): string[] {
  if (useGpt5) {
    return ALL_SUBJECTS;
  } else {
    return DEEPSEEK_ALLOWED_SUBJECTS;
  }
}

export function isSubjectAllowed(subject: string, useGpt5: boolean): boolean {
  const availableSubjects = getAvailableSubjects(useGpt5);
  return availableSubjects.includes(subject);
}

export function supportsImageUpload(useGpt5: boolean): boolean {
  return useGpt5; // Only GPT-5 supports image upload
}