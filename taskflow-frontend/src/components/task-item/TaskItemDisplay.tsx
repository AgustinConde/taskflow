import { Checkbox, Typography, Chip } from '@mui/material';
import type { Task } from '../../types/Task';
import type { Category } from '../../types/Category';

interface TaskItemDisplayProps {
    task: Task;
    onToggleCompleted: () => void;
    taskCategory: Category | null;
}

const TaskItemDisplay = ({ task, onToggleCompleted, taskCategory }: TaskItemDisplayProps) => {
    return (
        <>
            <Checkbox
                checked={task.isCompleted}
                onChange={onToggleCompleted}
                color="secondary"
                sx={{ mr: 1 }}
            />

            <Typography variant="subtitle1" sx={{ flex: 1, minWidth: 80, maxWidth: 180 }}>
                {task.title}
            </Typography>

            {taskCategory && (
                <Chip
                    label={taskCategory.name}
                    size="small"
                    sx={{
                        backgroundColor: taskCategory.color,
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 20,
                        mx: 1
                    }}
                />
            )}

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                    flex: 3,
                    minWidth: 120,
                    maxWidth: 340,
                    whiteSpace: 'pre-line',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                }}
                title={task.description}
            >
                {task.description}
            </Typography>
        </>
    );
};

export default TaskItemDisplay;
