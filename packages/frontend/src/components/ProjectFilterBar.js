import React from 'react';

function ProjectFilterBar({ projects, selectedProjectId, onSelectProject }) {
  if (!projects || projects.length === 0) return null;

  return (
    <div className="project-filter-bar" role="group" aria-label="Filter by project">
      <button
        className={`filter-chip${selectedProjectId === null ? ' filter-chip--active' : ''}`}
        onClick={() => onSelectProject(null)}
        aria-pressed={selectedProjectId === null}
      >
        All
      </button>
      {projects.map(project => (
        <button
          key={project.id}
          className={`filter-chip${selectedProjectId === project.id ? ' filter-chip--active' : ''}`}
          onClick={() => onSelectProject(project.id)}
          aria-pressed={selectedProjectId === project.id}
          style={selectedProjectId === project.id ? {
            backgroundColor: `var(--project-color-${project.colour})`,
            color: `var(--project-color-${project.colour}-text)`,
            borderColor: `var(--project-color-${project.colour})`,
          } : {}}
        >
          <span
            className="chip-colour-dot"
            style={{ backgroundColor: `var(--project-color-${project.colour})` }}
          />
          {project.title}
        </button>
      ))}
    </div>
  );
}

export default ProjectFilterBar;
