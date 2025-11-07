namespace TaskFlow.Api.DTOs
{
    public class UserSettingsDto
    {
        public bool AutoDeleteCompletedTasks { get; set; }
    }

    public class UpdateUserSettingsDto
    {
        public bool? AutoDeleteCompletedTasks { get; set; }
    }
}
