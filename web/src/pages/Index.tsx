
import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { StudentLookup } from '../components/StudentLookup';
import { GPASummary } from '../components/GPASummary';
import { MedicalCredits } from '../components/MedicalCredits';
import { Subjects } from '../components/Subjects';
import { SubjectDifficulty } from '../components/SubjectDifficulty';

export type ActiveSection = 'student-lookup' | 'gpa-summary' | 'medical-credits' | 'subjects' | 'subject-difficulty';

const Index = () => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('student-lookup');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'student-lookup':
        return <StudentLookup />;
      case 'gpa-summary':
        return <GPASummary />;
      case 'medical-credits':
        return <MedicalCredits />;
      case 'subjects':
        return <Subjects />;
      case 'subject-difficulty':
        return <SubjectDifficulty />;
      default:
        return <StudentLookup />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="flex-1 p-6 lg:ml-64">
        <div className="max-w-7xl mx-auto">
          {renderActiveSection()}
        </div>
      </main>
    </div>
  );
};

export default Index;
