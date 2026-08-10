import { getStoredCourses } from './adminStore';
import { AdminCourse, ExamType, Subject } from '../types';

export function getAllActiveCourses(examFilter?: ExamType): AdminCourse[] {
  const all = getStoredCourses();
  const visible = all.filter((c) => !c.isHidden);
  if (!examFilter) return visible;
  return visible.filter((c) => c.exam === examFilter);
}

export function getAllSubjects(examFilter?: ExamType): Subject[] {
  const baseSubjects: Subject[] = [
    { id: 'rus', name: 'Русский Язык', popular: true, exam: ['EGE', 'OGE'] },
    { id: 'prof_math', name: 'Профиль (Математика)', popular: true, exam: ['EGE'] },
    { id: 'base_math', name: 'База (Математика)', popular: true, exam: ['EGE'] },
    { id: 'soc', name: 'Обществознание', popular: true, exam: ['EGE', 'OGE'] },
    { id: 'cs', name: 'Информатика', popular: true, exam: ['EGE', 'OGE'] },
    { id: 'hist', name: 'История', exam: ['EGE', 'OGE'] },
    { id: 'chem', name: 'Химия', exam: ['EGE', 'OGE'] },
    { id: 'bio', name: 'Биология', exam: ['EGE', 'OGE'] },
    { id: 'phys', name: 'Физика', exam: ['EGE', 'OGE'] },
    { id: 'eng', name: 'Английский', exam: ['EGE', 'OGE'] },
    { id: 'lit', name: 'Литература', exam: ['EGE', 'OGE'] },
    { id: 'geo', name: 'География', exam: ['EGE', 'OGE'] },
  ];

  const courses = getAllActiveCourses(examFilter);
  const subjectNames = new Set(baseSubjects.map((s) => s.name.toLowerCase()));
  
  const customSubjects: Subject[] = [];
  courses.forEach((c) => {
    if (c.subject && !subjectNames.has(c.subject.toLowerCase())) {
      subjectNames.add(c.subject.toLowerCase());
      customSubjects.push({
        id: `custom-sub-${c.id}`,
        name: c.subject,
        exam: c.exam ? [c.exam] : ['EGE'],
      });
    }
  });

  return [...baseSubjects, ...customSubjects];
}
