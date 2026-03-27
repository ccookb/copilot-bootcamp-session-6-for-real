import React, { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
import ProjectService from '../services/projectService';

const ALLOWED_COLOURS = ['blue', 'green', 'red', 'yellow', 'purple', 'orange', 'teal', 'pink'];

function ColourPicker({ selected, onChange, disabled }) {
  return (
    <div className="colour-picker" role="radiogroup" aria-label="Project colour">
      {ALLOWED_COLOURS.map(colour => (
        <button
          key={colour}
          type="button"
          role="radio"
          aria-checked={selected === colour}
          aria-label={colour}
          disabled={disabled}
          className={`colour-swatch${selected === colour ? ' colour-swatch--selected' : ''}`}
          style={{
            backgroundColor: `var(--project-color-${colour})`,
          }}
          onClick={() => onChange(colour)}
          title={colour}
        />
      ))}
    </div>
  );
}

function ProjectsPanel({ projects, onProjectsChange }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createColour, setCreateColour] = useState('blue');
  const [createError, setCreateError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editColour, setEditColour] = useState('blue');
  const [editError, setEditError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createTitle.trim()) {
      setCreateError('Project title cannot be empty');
      return;
    }
    try {
      setIsCreating(true);
      setCreateError(null);
      await ProjectService.createProject(createTitle.trim(), createColour);
      setCreateTitle('');
      setCreateColour('blue');
      setShowCreateForm(false);
      onProjectsChange();
    } catch (err) {
      setCreateError(err.message || 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditStart = (project) => {
    setEditingId(project.id);
    setEditTitle(project.title);
    setEditColour(project.colour);
    setEditError(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditError(null);
  };

  const handleEditSubmit = async (id) => {
    if (!editTitle.trim()) {
      setEditError('Project title cannot be empty');
      return;
    }
    try {
      setIsEditing(true);
      setEditError(null);
      await ProjectService.updateProject(id, { title: editTitle.trim(), colour: editColour });
      setEditingId(null);
      onProjectsChange();
    } catch (err) {
      setEditError(err.message || 'Failed to update project');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await ProjectService.deleteProject(deleteId);
      setDeleteId(null);
      onProjectsChange();
    } catch (err) {
      console.error('Failed to delete project:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="projects-panel">
      <div className="projects-panel-header">
        <h2>Projects</h2>
        {!showCreateForm && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowCreateForm(true)}
          >
            + New Project
          </button>
        )}
      </div>

      {showCreateForm && (
        <form className="project-form" onSubmit={handleCreateSubmit}>
          <h3>New Project</h3>
          <input
            type="text"
            value={createTitle}
            onChange={(e) => { setCreateTitle(e.target.value); setCreateError(null); }}
            placeholder="Project title"
            maxLength={100}
            disabled={isCreating}
            className="form-input"
            aria-label="Project title"
            autoFocus
          />
          <ColourPicker selected={createColour} onChange={setCreateColour} disabled={isCreating} />
          {createError && <div className="form-error">{createError}</div>}
          <div className="project-form-actions">
            <button type="submit" className="btn btn-primary btn-sm" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={isCreating}
              onClick={() => { setShowCreateForm(false); setCreateTitle(''); setCreateError(null); }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {projects.length === 0 && !showCreateForm && (
        <div className="empty-state">
          <p className="empty-state-message">No projects yet. Create one to get started.</p>
        </div>
      )}

      <ul className="project-list">
        {projects.map(project => (
          <li key={project.id} className="project-item">
            {editingId === project.id ? (
              <div className="project-form">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => { setEditTitle(e.target.value); setEditError(null); }}
                  maxLength={100}
                  disabled={isEditing}
                  className="form-input"
                  aria-label="Edit project title"
                />
                <ColourPicker
                  selected={editColour}
                  onChange={setEditColour}
                  disabled={isEditing}
                />
                {editError && <div className="form-error">{editError}</div>}
                <div className="project-form-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={isEditing}
                    onClick={() => handleEditSubmit(project.id)}
                  >
                    {isEditing ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={isEditing}
                    onClick={handleEditCancel}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="project-item-content">
                <span
                  className="project-colour-swatch"
                  style={{ backgroundColor: `var(--project-color-${project.colour})` }}
                  aria-label={project.colour}
                />
                <span className="project-item-title">{project.title}</span>
                <div className="project-item-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleEditStart(project)}
                    aria-label={`Edit ${project.title}`}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setDeleteId(project.id)}
                    aria-label={`Delete ${project.title}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Delete Project?"
        message="Deleting this project will remove it from all associated todos. This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
        isLoading={isDeleting}
        isDangerous={true}
      />
    </div>
  );
}

export default ProjectsPanel;
