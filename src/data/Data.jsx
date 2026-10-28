const Data = ({children}) => {
  return (
    <div>
        {children}
    </div>
  )
}

export default Data

const employees = [
  { 
    "id": 1,
    "name": "Aarav Sharma",
    "email": "emp1@company.com",
    "password": "123",
    "taskNumbers": [
      { "label": "active", "count": 3 },
      { "label": "newTask", "count": 4 },
      { "label": "completed", "count": 3 },
      { "label": "failed", "count": 1 }
    ],
    "tasks": [
      {
        "newTask": true,
        "accepted": false,
        "failed": false,
        
        "completed": false,
        "title": "Prepare Sales Report",
        "description": "Compile Q3 sales data into a summary report.",
        "date": "2026-09-05",
        "category": "Reports"
      },
      {
        "newTask": false,
        "accepted": true,
        "failed": false,
        "completed": true,
        "title": "Client Meeting",
        "description": "Discuss project requirements with client.",
        "date": "2026-08-28",
        "category": "Meetings"
      },
      {
        "newTask": true,
        "accepted": true,
        "failed": false,
        "completed": false,
        "title": "Budget Review",
        "description": "Review Q3 budget allocations and spending.",
        "date": "2026-09-06",
        "category": "Finance"
      },
      {
        "newTask": false,
        "accepted": true,
        "failed": false,
        "completed": true,
        "title": "Email Campaign",
        "description": "Send promotional emails to customer list.",
        "date": "2026-08-26",
        "category": "Marketing"
      },
      {
        "newTask": true,
        "accepted": false,
        "failed": false,
        "completed": false,
        "title": "Documentation Update",
        "description": "Update API documentation for new endpoints.",
        "date": "2026-09-11",
        "category": "Documentation"
      },
      {
        "newTask": false,
        "accepted": true,
        "failed": false,
        "completed": true,
        "title": "Inventory Check",
        "description": "Verify office supply inventory levels.",
        "date": "2026-08-24",
        "category": "Admin"
      },
      {
        "newTask": true,
        "accepted": true,
        "failed": false,
        "completed": false,
        "title": "Customer Support Review",
        "description": "Analyze customer support tickets and feedback.",
        "date": "2026-09-09",
        "category": "Support"
      },
      {
        "newTask": false,
        "accepted": true,
        "failed": true,
        "completed": false,
        "title": "Server Maintenance",
        "description": "Perform scheduled database maintenance.",
        "date": "2026-08-31",
        "category": "IT"
      }
    ]
  },
  {
    "id": 2,
    "name": "Ishita Patel",
    "email": "emp2@company.com",
    "password": "123",
    "taskNumbers": [
      { "label": "active", "count": 2 },
      { "label": "newTask", "count": 4 },
      { "label": "completed", "count": 3 },
      { "label": "failed", "count": 1 }
    ],
    "tasks": [
      {
        "newTask": true,
        "accepted": true,
        "failed": false,
        "completed": false,
        "title": "Design Homepage",
        "description": "Create wireframes for the new homepage layout.",
        "date": "2026-09-07",
        "category": "Design"
      },
      {
        "newTask": false,
        "accepted": true,
        "failed": true,
        "completed": false,
        "title": "Bug Fix",
        "description": "Resolve login authentication issue.",
        "date": "2026-08-30",
        "category": "Development"
      },
      {
        "newTask": true,
        "accepted": false,
        "failed": false,
        "completed": false,
        "title": "Mobile App Testing",
        "description": "Test mobile app on various devices.",
        "date": "2026-09-13",
        "category": "QA"
      },
      {
        "newTask": false,
        "accepted": true,
        "failed": false,
        "completed": true,
        "title": "Code Review",
        "description": "Review pull requests from development team.",
        "date": "2026-08-23",
        "category": "Development"
      },
      {
        "newTask": true,
        "accepted": true,
        "failed": false,
        "completed": false,
        "title": "UI Mockup Update",
        "description": "Update UI mockups based on feedback.",
        "date": "2026-09-04",
        "category": "Design"
      },
      {
        "newTask": false,
        "accepted": true,
        "failed": false,
        "completed": true,
        "title": "Performance Optimization",
        "description": "Optimize database queries for better performance.",
        "date": "2026-08-22",
        "category": "Development"
      },
      {
        "newTask": true,
        "accepted": false,
        "failed": false,
        "completed": false,
        "title": "Backend API Development",
        "description": "Develop new REST API endpoints.",
        "date": "2026-09-14",
        "category": "Development"
      },
      {
        "newTask": false,
        "accepted": true,
        "failed": false,
        "completed": true,
        "title": "Security Audit",
        "description": "Conduct security audit of application.",
        "date": "2026-08-21",
        "category": "Security"
      }
    ]
  },
  {
    "id": 3,
    "name": "Rohan Mehta",
    "email": "emp3@company.com",
    "password": "123",
    "taskNumbers": [
      { "label": "active", "count": 2 },
      { "label": "newTask", "count": 4 },
      { "label": "completed", "count": 4 },
      { "label": "failed", "count": 0 }
    ],
    "tasks": [
      {
        "newTask": true,
        "accepted": false,
        "failed": false,
        "completed": false,
        "title": "Market Research",
        "description": "Analyze competitor strategies in the fintech sector.",
        "date": "2026-09-10",
        "category": "Research"
      },
      {
        "newTask": false,
        "accepted": true,
        "failed": false,
        "completed": true,
        "title": "Team Training",
        "description": "Conduct workshop on new CRM software.",
        "date": "2026-08-25",
        "category": "Training"
      },
      {
        "newTask": true,
        "accepted": true,
        "failed": false,
        "completed": false,
        "title": "Industry Analysis Report",
        "description": "Create comprehensive industry trend analysis.",
        "date": "2026-09-15",
        "category": "Research"
      },
      {
        "newTask": false,
        "accepted": true,
        "failed": false,
        "completed": true,
        "title": "Vendor Evaluation",
        "description": "Evaluate new software vendors.",
        "date": "2026-08-20",
        "category": "Procurement"
      },
      {
        "newTask": true,
        "accepted": false,
        "failed": false,
        "completed": false,
        "title": "Employee Onboarding",
        "description": "Prepare onboarding materials for new hires.",
        "date": "2026-09-02",
        "category": "HR"
      },
      {
        "newTask": false,
        "accepted": true,
        "failed": false,
        "completed": true,
        "title": "Policy Update",
        "description": "Update company HR policies.",
        "date": "2026-08-19",
        "category": "HR"
      },
      {
        "newTask": true,
        "accepted": true,
        "failed": false,
        "completed": false,
        "title": "Compliance Check",
        "description": "Verify compliance with industry regulations.",
        "date": "2026-09-16",
        "category": "Compliance"
      },
      {
        "newTask": false,
        "accepted": true,
        "failed": false,
        "completed": true,
        "title": "Quarterly Planning",
        "description": "Plan quarterly business objectives.",
        "date": "2026-08-18",
        "category": "Strategy"
      }
    ]
  },
  {
    "id": 4,
    "name": "Priya Nair",
    "email": "emp4@company.com",
    "password": "123",
    "taskNumbers": [
      { "label": "active", "count": 2 },
      { "label": "newTask", "count": 4 },
      { "label": "completed", "count": 3 },
      { "label": "failed", "count": 1 }
    ],
    "tasks": [
      {
        "newTask": true,
        "accepted": true,
        "failed": false,
        "completed": false,
        "title": "Prepare Presentation",
        "description": "Draft slides for upcoming board meeting.",
        "date": "2026-09-08",
        "category": "Presentation"
      },
      {
        "newTask": false,
        "accepted": true,
        "failed": false,
        "completed": true,
        "title": "System Upgrade",
        "description": "Update servers to latest security patch.",
        "date": "2026-08-29",
        "category": "IT"
      },
      {
        "newTask": true,
        "accepted": false,
        "failed": false,
        "completed": false,
        "title": "Infrastructure Planning",
        "description": "Plan infrastructure upgrades for next quarter.",
        "date": "2026-09-17",
        "category": "IT"
      },
      {
        "newTask": false,
        "accepted": true,
        "failed": false,
        "completed": true,
        "title": "Network Configuration",
        "description": "Configure network settings for new office.",
        "date": "2026-08-17",
        "category": "IT"
      },
      {
        "newTask": true,
        "accepted": true,
        "failed": false,
        "completed": false,
        "title": "Data Backup Verification",
        "description": "Verify all critical data backups are working.",
        "date": "2026-09-03",
        "category": "IT"
      },
      {
        "newTask": false,
        "accepted": true,
        "failed": false,
        "completed": true,
        "title": "Software License Audit",
        "description": "Audit all software licenses.",
        "date": "2026-08-16",
        "category": "IT"
      },
      {
        "newTask": true,
        "accepted": false,
        "failed": false,
        "completed": false,
        "title": "Disaster Recovery Plan",
        "description": "Update disaster recovery procedures.",
        "date": "2026-09-18",
        "category": "IT"
      },
      {
        "newTask": false,
        "accepted": true,
        "failed": true,
        "completed": false,
        "title": "Hardware Procurement",
        "description": "Order new hardware for development team.",
        "date": "2026-08-15",
        "category": "Procurement"
      }
    ]
  },
  {
    "id": 5,
    "name": "Vikram Singh",
    "email": "emp5@company.com",
    "password": "123",
    "taskNumbers": [
      { "label": "active", "count": 2 },
      { "label": "newTask", "count": 4 },
      { "label": "completed", "count": 4 },
      { "label": "failed", "count": 0 }
    ],
    "tasks": [
      {
        "newTask": true,
        "accepted": false,
        "failed": false,
        "completed": false,
        "title": "Social Media Campaign",
        "description": "Plan September campaign for Instagram and LinkedIn.",
        "date": "2026-09-12",
        "category": "Marketing"
      },
      {
        "newTask": false,
        "accepted": true,
        "failed": false,
        "completed": true,
        "title": "Content Writing",
        "description": "Write blog post on AI trends.",
        "date": "2026-08-27",
        "category": "Content"
      },
      {
        "newTask": true,
        "accepted": true,
        "failed": false,
        "completed": false,
        "title": "Brand Strategy Review",
        "description": "Review and update brand strategy.",
        "date": "2026-09-19",
        "category": "Marketing"
      },
      {
        "newTask": false,
        "accepted": true,
        "failed": false,
        "completed": true,
        "title": "Social Media Analytics",
        "description": "Analyze social media performance metrics.",
        "date": "2026-08-14",
        "category": "Analytics"
      },
      {
        "newTask": true,
        "accepted": false,
        "failed": false,
        "completed": false,
        "title": "Press Release Writing",
        "description": "Write press release for new product launch.",
        "date": "2026-09-20",
        "category": "PR"
      },
      {
        "newTask": false,
        "accepted": true,
        "failed": false,
        "completed": true,
        "title": "Website Content Update",
        "description": "Update website content and copy.",
        "date": "2026-08-13",
        "category": "Content"
      },
      {
        "newTask": true,
        "accepted": true,
        "failed": false,
        "completed": false,
        "title": "Email Marketing Campaign",
        "description": "Create and launch email marketing campaign.",
        "date": "2026-09-01",
        "category": "Marketing"
      },
      {
        "newTask": false,
        "accepted": true,
        "failed": false,
        "completed": true,
        "title": "Influencer Outreach",
        "description": "Contact and collaborate with influencers.",
        "date": "2026-08-12",
        "category": "Marketing"
      }
    ]
  }
]
const admin = [{
  'name':'Raj Poswal',
  'email': "admin@me.com",
  'password': "123",
  'id' : 1
}]

employees.forEach((employee) => {
  employee.taskNumbers = [
    {
      label: "active",
      count: employee.tasks.filter((task) => task.accepted).length,
    },
    {
      label: "newTask",
      count: employee.tasks.filter((task) => task.newTask).length,
    },
    {
      label: "completed",
      count: employee.tasks.filter((task) => task.completed).length,
    },
    {
      label: "failed",
      count: employee.tasks.filter((task) => task.failed).length,
    },
  ];
});

export const setLocalStorage = () => {
    localStorage.setItem("employees", JSON.stringify(employees));
    localStorage.setItem("admin", JSON.stringify(admin));
}
export const getLocalStorage = () => {
    const employeesData = JSON.parse(localStorage.getItem("employees"));
    const adminData = JSON.parse(localStorage.getItem("admin"));
    return {
        employees : employeesData ,
        admin: adminData 
    };
}

