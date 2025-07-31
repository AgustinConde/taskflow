import { Stack } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import TaskItem from '../task-item';
import type { Task } from '../../types/Task';
import type { Category } from '../../types/Category';

interface TaskGridProps {
    tasks: Task[];
    categories: Category[];
    onEditSave: (task: Task) => void;
    onDelete: (id: number) => void;
    onToggleCompleted: (task: Task) => void;
    onDragEnd: (result: DropResult) => void;
    isDragEnabled: boolean;
}

const TaskGrid = ({
    tasks,
    categories,
    onEditSave,
    onDelete,
    onToggleCompleted,
    onDragEnd,
    isDragEnabled
}: TaskGridProps) => {
    if (isDragEnabled) {
        return (
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="tasklist-droppable">
                    {(provided) => (
                        <Stack spacing={2} ref={provided.innerRef} {...provided.droppableProps}>
                            {tasks.map((task, idx) => (
                                task.id ? (
                                    <Draggable key={task.id} draggableId={task.id.toString()} index={idx}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{
                                                    ...provided.draggableProps.style,
                                                    opacity: snapshot.isDragging ? 0.7 : 1,
                                                }}
                                            >
                                                <TaskItem
                                                    task={task}
                                                    onEditSave={onEditSave}
                                                    onDelete={() => onDelete(task.id)}
                                                    onToggleCompleted={() => onToggleCompleted(task)}
                                                    categories={categories}
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                ) : null
                            ))}
                            {provided.placeholder}
                        </Stack>
                    )}
                </Droppable>
            </DragDropContext>
        );
    }

    return (
        <Stack spacing={2}>
            {tasks.map((task) => (
                task.id ? (
                    <TaskItem
                        key={task.id}
                        task={task}
                        onEditSave={onEditSave}
                        onDelete={() => onDelete(task.id)}
                        onToggleCompleted={() => onToggleCompleted(task)}
                        categories={categories}
                    />
                ) : null
            ))}
        </Stack>
    );
};

export default TaskGrid;
