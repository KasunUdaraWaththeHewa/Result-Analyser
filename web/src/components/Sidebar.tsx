
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  GraduationCap, 
  BarChart3, 
  Heart, 
  BookOpen, 
  TrendingUp,
  Menu,
  X
} from 'lucide-react';
import { ActiveSection } from '../pages/Index';

interface SidebarProps {
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
}

const menuItems = [
  {
    id: 'student-lookup' as ActiveSection,
    label: 'Student Lookup',
    icon: GraduationCap,
    description: 'Search student results'
  },
  {
    id: 'gpa-summary' as ActiveSection,
    label: 'GPA Summary',
    icon: BarChart3,
    description: 'View GPA statistics'
  },
  {
    id: 'medical-credits' as ActiveSection,
    label: 'Medical Credits',
    icon: Heart,
    description: 'MC usage tracking'
  },
  {
    id: 'subjects' as ActiveSection,
    label: 'Subjects & Difficulty',
    icon: BookOpen,
    description: 'Subject information'
  },
];

export const Sidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-primary-foreground rounded-md"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-card border-r border-border transition-transform duration-300 z-40",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Student Portal
          </h1>
          <p className="text-sm text-muted-foreground">
            Academic Management System
          </p>
        </div>

        <nav className="px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSectionChange(item.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-colors duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon size={20} />
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className={cn(
                      "text-xs",
                      isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}>
                      {item.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
