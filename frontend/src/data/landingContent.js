
import {
  BarChart3,
  BrainCircuit,
  GitBranch,
} from "lucide-react";

export const features = [
  {
    icon: BrainCircuit,
    number: "01",
    title: "Intelligent task allocation",
    description:
      "Connect employee skills with task requirements and build a foundation for smarter, AI-assisted assignments.",
    glow: "violet",
  },
  {
    icon: BarChart3,
    number: "02",
    title: "Workload visibility",
    description:
      "Understand working capacity, active tasks, and deadlines before your team becomes overloaded.",
    glow: "cyan",
  },
  {
    icon: GitBranch,
    number: "03",
    title: "One connected workspace",
    description:
      "Bring employees, departments, tasks, and progress into one organized system.",
    glow: "blue",
  },
];

export const workflowSteps = [
  {
    number: "01",
    title: "Organize your team",
    text: "Maintain employee profiles, departments, skills, and working capacity.",
  },
  {
    number: "02",
    title: "Keep work moving",
    text: "Create tasks, assign ownership, and make priorities and deadlines clear.",
  },
  {
    number: "03",
    title: "Make informed decisions",
    text: "Use structured workforce data as the foundation for future AI insights.",
  },
];

export const demoTasks = [
  {
    name: "Authentication flow",
    status: "In progress",
    dot: "bg-cyan-300",
  },
  {
    name: "Dashboard redesign",
    status: "In review",
    dot: "bg-violet-300",
  },
  {
    name: "API integration",
    status: "To do",
    dot: "bg-amber-300",
  },
];
