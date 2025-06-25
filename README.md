# Project Dashboard

A lightweight but polished internal dashboard built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- **KPI Cards**: Display key project metrics (Total Projects, On-Track, At-Risk, Blocked)
- **Team Resource Heat Map**: Placeholder for team capacity visualization
- **Upcoming Work Gantt**: Placeholder for project timeline visualization
- **Responsive Design**: Optimized for desktop and mobile viewing
- **Lazy Loading**: Charts are loaded with Suspense for better performance

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) in your browser.

## Project Structure 
src/
├── app/
│ ├── dashboard/
│ │ └── page.tsx # Main dashboard page
│ ├── globals.css # Global styles
│ ├── layout.tsx # Root layout
│ └── page.tsx # Home page (redirects to dashboard)
├── components/
│ ├── dashboard/
│ │ ├── kpi-cards.tsx # KPI cards component
│ │ ├── team-resource-heatmap.tsx # Heat map placeholder
│ │ └── upcoming-work-gantt.tsx # Gantt chart placeholder
│ └── ui/
│ └── card.tsx # shadcn/ui card component
└── lib/
└── utils.ts # Utility functions
```

## Customization

- **KPI Data**: Update the `kpiData` array in `kpi-cards.tsx` to display real metrics
- **Charts**: Replace the placeholder components with actual chart libraries (e.g., Recharts, Chart.js)
- **Styling**: Modify Tailwind classes or add custom CSS in `globals.css`
- **Data Integration**: Connect to your backend APIs or data sources

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Lucide React** for icons