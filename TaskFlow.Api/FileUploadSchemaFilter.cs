using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace TaskFlow.Api
{
    public class FileUploadSchemaFilter : ISchemaFilter
    {
        public void Apply(OpenApiSchema schema, SchemaFilterContext context)
        {
            if (context.Type == typeof(IFormFile))
            {
                schema.Type = "string";
                schema.Format = "binary";
            }
        }
    }
}
