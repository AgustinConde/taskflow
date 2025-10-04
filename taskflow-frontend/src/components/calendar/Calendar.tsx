import React, { useState, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    useTheme,
    alpha
} from '@mui/material';
import {
    ChevronLeft,
    ChevronRight,
    Today
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useTranslation } from 'react-i18next';
import type { Task } from '../../types/Task';
import type { Category } from '../../types/Category';

interface CalendarProps {
    tasks: Task[];
    categories: Category[];
    onTaskClick?: (task: Task) => void;
    onDateClick?: (date: Date) => void;
    onTaskDateChange?: (taskId: number, newDate: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({
    tasks,
    categories,
    onTaskClick,
    onDateClick,
    onTaskDateChange
}) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const [currentDate, setCurrentDate] = useState(new Date());

    const getLocalDateString = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const getTasksForDate = useMemo(() => {
        return (date: Date) => {
            const dateStr = getLocalDateString(date);
            return tasks.filter(task => {
                if (!task.dueDate) return false;
                const taskDate = new Date(task.dueDate);
                const taskDateStr = getLocalDateString(taskDate);
                return taskDateStr === dateStr;
            });
        };
    }, [tasks]);

    const calendarDays = useMemo(() => {
        const days = [];

        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dayTasks = getTasksForDate(date);
            days.push({ date, tasks: dayTasks });
        }

        return days;
    }, [currentYear, currentMonth, daysInMonth, startingDayOfWeek, getTasksForDate]);

    const weekDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };



    return (
        <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">
                    {new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                    })}
                </Typography>

                <Box display="flex" gap={1}>
                    <IconButton onClick={goToPreviousMonth} size="small">
                        <ChevronLeft />
                    </IconButton>

                    <IconButton onClick={goToToday} size="small" color="primary">
                        <Today />
                    </IconButton>

                    <IconButton onClick={goToNextMonth} size="small">
                        <ChevronRight />
                    </IconButton>
                </Box>
            </Box>

            {/* Week days header */}
            <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" sx={{ mb: 1 }}>
                {weekDays.map((day) => (
                    <Box key={day}>
                        <Box
                            textAlign="center"
                            py={1}
                            sx={{
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                backgroundColor: alpha(theme.palette.primary.main, 0.05)
                            }}
                        >
                            <Typography variant="subtitle2" fontWeight="bold" color="textSecondary">
                                {t(day)}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Calendar grid with drag and drop */}
            <DragDropContext onDragEnd={(result) => {
                if (!result.destination || !onTaskDateChange) return;

                const taskId = parseInt(result.draggableId);
                const destinationDateStr = result.destination.droppableId;

                if (destinationDateStr !== 'invalid') {
                    const destinationDate = new Date(destinationDateStr);
                    onTaskDateChange(taskId, destinationDate);
                }
            }}>
                <Box
                    display="grid"
                    gridTemplateColumns="repeat(7, 1fr)"
                    sx={{ height: 'calc(100% - 120px)', minHeight: 600 }}
                >
                    {calendarDays.map((dayData, index) => {
                        const dateStr = dayData ? getLocalDateString(dayData.date) : 'invalid';

                        return (
                            <Droppable key={index} droppableId={dateStr}>
                                {(provided, snapshot) => (
                                    <Box
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        sx={{
                                            border: `1px solid ${theme.palette.divider}`,
                                            cursor: dayData ? 'pointer' : 'default',
                                            position: 'relative',
                                            p: 1,
                                            minHeight: 100,
                                            backgroundColor: dayData && isToday(dayData.date)
                                                ? alpha(theme.palette.primary.main, 0.1)
                                                : snapshot.isDraggingOver
                                                    ? alpha(theme.palette.primary.main, 0.05)
                                                    : 'transparent',
                                            '&:hover': dayData ? {
                                                backgroundColor: alpha(theme.palette.action.hover, 0.5)
                                            } : {}
                                        }}
                                        onClick={() => dayData && onDateClick?.(dayData.date)}
                                    >
                                        {dayData && (
                                            <>
                                                {/* Day number */}
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: isToday(dayData.date) ? 'bold' : 'normal',
                                                        color: isToday(dayData.date)
                                                            ? theme.palette.primary.main
                                                            : 'inherit',
                                                        mb: 0.5
                                                    }}
                                                >
                                                    {dayData.date.getDate()}
                                                </Typography>

                                                {/* Tasks for this day */}
                                                <Box>
                                                    {dayData.tasks.slice(0, 3).map((task, taskIndex) => {
                                                        const category = categories.find(cat => cat.id === task.categoryId);
                                                        return (
                                                            <Draggable
                                                                key={task.id}
                                                                draggableId={task.id.toString()}
                                                                index={taskIndex}
                                                            >
                                                                {(provided, snapshot) => (
                                                                    <Box
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        sx={{
                                                                            fontSize: '10px',
                                                                            p: 0.5,
                                                                            mb: 0.5,
                                                                            borderRadius: 0.5,
                                                                            backgroundColor: category?.color || theme.palette.primary.main,
                                                                            color: 'white',
                                                                            cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            whiteSpace: 'nowrap',
                                                                            opacity: task.isCompleted ? 0.6 : 1,
                                                                            transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
                                                                            boxShadow: snapshot.isDragging ? theme.shadows[8] : 'none'
                                                                        }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onTaskClick?.(task);
                                                                        }}
                                                                    >
                                                                        {task.title}
                                                                    </Box>
                                                                )}
                                                            </Draggable>
                                                        );
                                                    })}

                                                    {dayData.tasks.length > 3 && (
                                                        <Typography
                                                            variant="caption"
                                                            color="textSecondary"
                                                            sx={{ fontSize: '9px' }}
                                                        >
                                                            +{dayData.tasks.length - 3} more
                                                        </Typography>
                                                    )}
                                                    {provided.placeholder}
                                                </Box>
                                            </>
                                        )}
                                    </Box>
                                )}
                            </Droppable>
                        );
                    })}
                </Box>
            </DragDropContext>
        </Paper>
    );
};

export default Calendar;