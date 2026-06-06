import React from 'react';
import { FiPlay, FiFileText, FiLock } from 'react-icons/fi';

const CurriculumSidebar = ({ modules }) => (
    <div className="curriculum-list aura-card">
        <h3>Course Content</h3>
        {modules.map((mod, i) => (
            <div key={i} className="module-item">
                <h5>{mod.title}</h5>
                {mod.lessons.map((lesson, j) => (
                    <div key={j} className={`lesson-row ${lesson.isLocked ? 'locked' : ''}`}>
                        {lesson.type === 'video' ? <FiPlay /> : <FiFileText />}
                        <span>{lesson.name}</span>
                        {lesson.isLocked && <FiLock className="lock-icon" />}
                    </div>
                ))}
            </div>
        ))}
    </div>
);
export default CurriculumSidebar;