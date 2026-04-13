import { X } from "lucide-react";

const NOTE_TEMPLATES = [
  {
    id: "daily-standup",
    name: "Daily Standup",
    emoji: "🎯",
    content: `## Daily Standup - ${new Date().toLocaleDateString()}

### What I accomplished yesterday:
- 

### What I'm working on today:
- 

### Blockers/Challenges:
- 

### Notes:
`,
  },
  {
    id: "meeting-notes",
    name: "Meeting Notes",
    emoji: "📋",
    content: `## Meeting Notes

**Date:** ${new Date().toLocaleDateString()}
**Attendees:** 
**Purpose:** 

### Agenda:
1. 
2. 
3. 

### Discussion Points:


### Action Items:
- [ ] 
- [ ] 

### Next Steps:
`,
  },
  {
    id: "brainstorm",
    name: "Brainstorm Session",
    emoji: "💡",
    content: `## Brainstorm: [Topic]

**Date:** ${new Date().toLocaleDateString()}

### Main Goal:


### Ideas:
1. 
2. 
3. 
4. 
5. 

### Evaluation:


### Top 3 Ideas to Pursue:
1. 
2. 
3. 
`,
  },
  {
    id: "project-plan",
    name: "Project Plan",
    emoji: "📊",
    content: `## Project: [Project Name]

### Overview:


### Goals:
1. 
2. 
3. 

### Timeline:
- **Start:** 
- **End:** 
- **Duration:** 

### Deliverables:
- [ ] 
- [ ] 
- [ ] 

### Resources Needed:


### Team Members:
- 
- 

### Risks:


### Success Metrics:
`,
  },
  {
    id: "book-notes",
    name: "Book Notes",
    emoji: "📚",
    content: `## Book: [Title]

**Author:** 
**Genre:** 
**Date Read:** 

### Summary:


### Key Takeaways:
1. 
2. 
3. 

### Favorite Quotes:


### Personal Reflection:


### Rating: ⭐⭐⭐⭐⭐

### Recommended For:
`,
  },
  {
    id: "homework",
    name: "Homework/Assignment",
    emoji: "✏️",
    content: `## Assignment: [Subject - Topic]

**Due Date:** ${new Date().toLocaleDateString()}
**Class/Course:** 

### Instructions:


### My Answers:


### Key Concepts:


### Questions/Clarifications Needed:


### Revision Notes:
`,
  },
];

const NoteTemplatesModal = ({
  isOpen,
  onClose,
  isDarkMode,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`relative w-full max-w-2xl rounded-2xl shadow-2xl border max-h-96 overflow-y-auto ${
          isDarkMode
            ? "bg-slate-900 border-white/10"
            : "bg-white border-gray-200"
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`sticky top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors float-right z-10 ${
            isDarkMode
              ? "text-white/60 hover:text-white"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <X size={24} />
        </button>

        <div className="p-8 clear-both">
          <h2
            className={`text-3xl font-bold mb-2 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Note Templates
          </h2>
          <p
            className={`text-sm mb-8 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Choose a template to get started with your note
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {NOTE_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  onSelectTemplate(template.content);
                  onClose();
                }}
                className={`p-4 rounded-xl border-2 transition-all hover:scale-105 text-left ${
                  isDarkMode
                    ? "bg-slate-800/50 border-blue-400/30 hover:border-blue-400/70 hover:bg-slate-800"
                    : "bg-blue-50 border-blue-200 hover:border-blue-400 hover:bg-blue-100"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{template.emoji}</span>
                  <h3
                    className={`font-semibold text-lg ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {template.name}
                  </h3>
                </div>
                <p
                  className={`text-xs ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Pre-formatted template for quick note creation
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteTemplatesModal;
