export const ROADMAP_TRACKS = [
    {
        id: "fullstack",
        title: "Full-Stack Developer",
        subtitle: "Master end-to-end web applications with React 19, ASP.NET Core, and SQL Databases",
        icon: "💻",
        color: "#6366f1",
        stages: [
            {
                id: "fs-1",
                stageNumber: 1,
                title: "Frontend Core Fundamentals",
                level: "Beginner",
                duration: "3-4 Weeks",
                desc: "HTML5 Semantic Elements, Modern CSS3 Flexbox/Grid, JavaScript ES6+ Async/Await, and DOM manipulation.",
                skills: ["HTML5", "CSS3", "JavaScript ES6+", "DOM API", "Fetch API"],
                concepts: [
                    "Semantic HTML & Accessibility (a11y)",
                    "Flexbox & CSS Grid Layout Systems",
                    "JavaScript Promises, Async/Await & Event Loop",
                    "HTTP Methods, REST principles, and JSON parsing"
                ],
                resources: [
                    { title: "MDN Web Docs - JavaScript Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
                    { title: "javascript.info - Modern JavaScript", url: "https://javascript.info/" }
                ],
                interviewQuestions: [
                    "Explain the difference between event bubbling and event capturing.",
                    "What is the JavaScript Event Loop and how do microtasks differ from macrotasks?"
                ]
            },
            {
                id: "fs-2",
                stageNumber: 2,
                title: "React & Component Architecture",
                level: "Intermediate",
                duration: "4 Weeks",
                desc: "JSX, Component State, Hooks (useState, useEffect, useMemo), React Router v7, and API Integration.",
                skills: ["React 19", "JSX", "Hooks", "React Router", "Axios"],
                concepts: [
                    "Virtual DOM and Reconciliation Algorithm",
                    "Custom Hooks for reusable logic",
                    "State management patterns & prop drilling avoidance",
                    "Optimized rendering with useMemo and useCallback"
                ],
                resources: [
                    { title: "Official React Documentation", url: "https://react.dev/" },
                    { title: "FreeCodeCamp React Course", url: "https://www.freecodecamp.org/learn/front-end-development-libraries/" }
                ],
                interviewQuestions: [
                    "How does React reconciliation work under the hood?",
                    "What is the difference between useEffect and useLayoutEffect?"
                ]
            },
            {
                id: "fs-3",
                stageNumber: 3,
                title: "Backend API with .NET & C#",
                level: "Intermediate",
                duration: "4-5 Weeks",
                desc: "C# Fundamentals, ASP.NET Core Web API, Middleware pipeline, REST design, and Dependency Injection.",
                skills: ["C#", ".NET 8/9", "ASP.NET Core", "REST API", "Swagger"],
                concepts: [
                    "Object-Oriented Programming (OOP) in C#",
                    "Dependency Injection (Transient, Scoped, Singleton)",
                    "Custom Middleware pipeline execution",
                    "API Controllers, DTOs, and AutoMapper"
                ],
                resources: [
                    { title: "Microsoft .NET Documentation", url: "https://learn.microsoft.com/en-us/dotnet/" },
                    { title: "ASP.NET Core Web API Tutorial", url: "https://learn.microsoft.com/en-us/aspnet/core/tutorials/first-web-api" }
                ],
                interviewQuestions: [
                    "Explain Dependency Injection lifetimes in ASP.NET Core.",
                    "How do async/await work in C# and how do you avoid deadlocks?"
                ]
            },
            {
                id: "fs-4",
                stageNumber: 4,
                title: "Database Engineering & ORM",
                level: "Advanced",
                duration: "3-4 Weeks",
                desc: "Relational DB design, SQL Server / PostgreSQL, Entity Framework Core, Indexing, and Migrations.",
                skills: ["SQL Server", "EF Core", "LINQ", "Database Indexing", "Transactions"],
                concepts: [
                    "Relational DB Schema Normalization (1NF, 2NF, 3NF)",
                    "Entity Framework Core DbContext & Migrations",
                    "LINQ query optimization & avoiding N+1 problem",
                    "ACID properties & DB transaction management"
                ],
                resources: [
                    { title: "Entity Framework Core Docs", url: "https://learn.microsoft.com/en-us/ef/core/" },
                    { title: "SQLBolt - Interactive SQL Lessons", url: "https://sqlbolt.com/" }
                ],
                interviewQuestions: [
                    "What is the N+1 query problem in EF Core and how do you solve it?",
                    "Explain Clustered vs Non-Clustered Indexes in SQL Server."
                ]
            },
            {
                id: "fs-5",
                stageNumber: 5,
                title: "Security, Deployment & Cloud",
                level: "Expert",
                duration: "4 Weeks",
                desc: "JWT Authentication, CORS, HTTPS, Docker Containerization, CI/CD with GitHub Actions, and Azure/Vercel deployment.",
                skills: ["JWT Auth", "Docker", "CI/CD", "Azure", "Security"],
                concepts: [
                    "JWT authentication & refresh token rotation",
                    "CORS, XSS, and CSRF defense strategies",
                    "Docker containerization for frontend & backend",
                    "Automated deployment pipelines with GitHub Actions"
                ],
                resources: [
                    { title: "Docker Getting Started Guide", url: "https://docs.docker.com/get-started/" },
                    { title: "Azure App Service Documentation", url: "https://learn.microsoft.com/en-us/azure/app-service/" }
                ],
                interviewQuestions: [
                    "How do secure JWT refresh tokens work with HttpOnly cookies?",
                    "What are the key steps in containerizing a full-stack web application?"
                ]
            }
        ]
    },
    {
        id: "frontend",
        title: "Frontend React Specialist",
        subtitle: "Build modern, accessible, high-performance UI applications with React & TypeScript",
        icon: "🎨",
        color: "#3b82f6",
        stages: [
            {
                id: "fe-1",
                stageNumber: 1,
                title: "UI/UX & CSS Architecture",
                level: "Beginner",
                duration: "2-3 Weeks",
                desc: "Advanced CSS Flexbox/Grid, Responsive Web Design, Tailwind / Custom CSS Variables, and Glassmorphism.",
                skills: ["CSS3", "TailwindCSS", "Flexbox", "Grid", "Animations"],
                concepts: [
                    "Fluid Typography and Clamp functions",
                    "CSS Custom Properties & Dark Mode theme engine",
                    "Keyframe animations and UI micro-interactions"
                ],
                resources: [
                    { title: "CSS-Tricks Guide to Flexbox", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" }
                ],
                interviewQuestions: ["Explain how the CSS Box Model works and how box-sizing alters it."]
            },
            {
                id: "fe-2",
                stageNumber: 2,
                title: "TypeScript & Robust Code",
                level: "Intermediate",
                duration: "3 Weeks",
                desc: "Type safety, Interfaces, Generics, Union Types, Utility Types, and Strict Type Checking in React.",
                skills: ["TypeScript", "Generics", "Type Inference", "Interfaces"],
                concepts: [
                    "TypeScript Generics & Utility Types (Partial, Pick, Omit)",
                    "Strict null checks & Type Narrowing",
                    "Typing React Props, Events, and Custom Hooks"
                ],
                resources: [
                    { title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html" }
                ],
                interviewQuestions: ["Compare Interface vs Type Alias in TypeScript."]
            },
            {
                id: "fe-3",
                stageNumber: 3,
                title: "State Architecture & Performance",
                level: "Advanced",
                duration: "4 Weeks",
                desc: "State management with Redux Toolkit / Zustand, TanStack Query for server state, Code-Splitting, and Core Web Vitals.",
                skills: ["Zustand", "TanStack Query", "Vite", "Web Vitals", "Memoization"],
                concepts: [
                    "Server State vs UI Client State separation",
                    "Code Splitting with React.lazy and Suspense",
                    "Optimizing LCP, CLS, and INP metrics"
                ],
                resources: [
                    { title: "Web.dev Core Web Vitals Guide", url: "https://web.dev/vitals/" }
                ],
                interviewQuestions: ["How do you identify and fix memory leaks or unnecessary re-renders in React?"]
            }
        ]
    },
    {
        id: "backend",
        title: "Backend .NET Architect",
        subtitle: "Design high-throughput, enterprise microservices and clean code backends with C# & .NET 8/9",
        icon: "⚙️",
        color: "#10b981",
        stages: [
            {
                id: "be-1",
                stageNumber: 1,
                title: "C# Deep Dive & OOP Design",
                level: "Beginner",
                duration: "3 Weeks",
                desc: "C# Language Fundamentals, Generics, Delegates, Events, LINQ, and SOLID Principles.",
                skills: ["C#", "LINQ", "OOP", "SOLID Principles"],
                concepts: [
                    "SOLID Principles in software design",
                    "Memory management: Stack vs Heap & Garbage Collection",
                    "LINQ Deferred Execution vs Immediate Execution"
                ],
                resources: [
                    { title: "C# Documentation - Microsoft Learn", url: "https://learn.microsoft.com/en-us/dotnet/csharp/" }
                ],
                interviewQuestions: ["Explain each of the 5 SOLID principles with a real-world example."]
            },
            {
                id: "be-2",
                stageNumber: 2,
                title: "Clean Architecture & CQRS",
                level: "Advanced",
                duration: "4 Weeks",
                desc: "Clean Architecture, MediatR for CQRS pattern, Domain-Driven Design (DDD), and Repository Pattern.",
                skills: ["Clean Architecture", "CQRS", "MediatR", "DDD", "Unit Testing"],
                concepts: [
                    "Separation of Concerns: Domain, Application, Infrastructure, API",
                    "Command Query Responsibility Segregation (CQRS)",
                    "Domain Events & Value Objects"
                ],
                resources: [
                    { title: "Jason Taylor's Clean Architecture Guide", url: "https://github.com/jasontaylordev/CleanArchitecture" }
                ],
                interviewQuestions: ["What are the benefits of CQRS combined with MediatR in enterprise .NET applications?"]
            },
            {
                id: "be-3",
                stageNumber: 3,
                title: "Distributed Caching & Microservices",
                level: "Expert",
                duration: "5 Weeks",
                desc: "Redis Caching, RabbitMQ Message Queues, gRPC inter-service communication, and Distributed Tracing.",
                skills: ["Redis", "RabbitMQ", "gRPC", "Microservices", "OpenTelemetry"],
                concepts: [
                    "Cache-aside pattern & Redis distributed caching",
                    "Asynchronous messaging queues with RabbitMQ / MassTransit",
                    "gRPC vs REST performance trade-offs"
                ],
                resources: [
                    { title: "Redis Developer Portal", url: "https://redis.io/docs/" }
                ],
                interviewQuestions: ["How do you handle eventual consistency and distributed transactions using the Saga Pattern?"]
            }
        ]
    },
    {
        id: "datascience",
        title: "Data Science & AI Engineer",
        subtitle: "Master data pipelines, machine learning models, neural networks, and modern AI Agent building",
        icon: "📊",
        color: "#a855f7",
        stages: [
            {
                id: "ds-1",
                stageNumber: 1,
                title: "Python Data Stack & EDA",
                level: "Beginner",
                duration: "3 Weeks",
                desc: "Python for Data Analysis, NumPy arrays, Pandas DataFrames, Data Cleaning, and Matplotlib/Seaborn.",
                skills: ["Python", "Pandas", "NumPy", "Matplotlib", "Jupyter"],
                concepts: [
                    "Data Manipulation & Vectorization with NumPy/Pandas",
                    "Handling missing values and outliers",
                    "Exploratory Data Analysis (EDA) techniques"
                ],
                resources: [
                    { title: "Pandas User Guide", url: "https://pandas.pydata.org/docs/user_guide/index.html" }
                ],
                interviewQuestions: ["How do vectorization and broadcasting speed up computations in NumPy?"]
            },
            {
                id: "ds-2",
                stageNumber: 2,
                title: "Machine Learning Foundations",
                level: "Intermediate",
                duration: "4 Weeks",
                desc: "Supervised & Unsupervised Learning, Regression, Decision Trees, Random Forests, Scikit-Learn, and Feature Engineering.",
                skills: ["Scikit-Learn", "Regression", "Classification", "Feature Engineering"],
                concepts: [
                    "Bias-Variance Tradeoff and Cross-Validation",
                    "Hyperparameter Tuning (GridSearch & RandomSearch)",
                    "Model evaluation metrics: Precision, Recall, F1-Score, ROC-AUC"
                ],
                resources: [
                    { title: "Scikit-Learn Tutorials", url: "https://scikit-learn.org/stable/tutorial/index.html" }
                ],
                interviewQuestions: ["What is the difference between Precision and Recall, and when would you optimize for Recall?"]
            },
            {
                id: "ds-3",
                stageNumber: 3,
                title: "Deep Learning & AI LLMs",
                level: "Expert",
                duration: "5 Weeks",
                desc: "PyTorch, Neural Networks, Transformers, Hugging Face, Retrieval-Augmented Generation (RAG), and AI Agents.",
                skills: ["PyTorch", "Transformers", "RAG", "LangChain", "Vector DBs"],
                concepts: [
                    "Attention Mechanism & Transformer Architecture",
                    "RAG pipelines with Embeddings and Vector Databases (Chroma/Pinecone)",
                    "Fine-tuning Open Source LLMs (Llama 3, Mistral)"
                ],
                resources: [
                    { title: "Hugging Face Deep Learning Course", url: "https://huggingface.co/learn" }
                ],
                interviewQuestions: ["Explain how Retrieval-Augmented Generation (RAG) reduces LLM hallucinations."]
            }
        ]
    }
];
