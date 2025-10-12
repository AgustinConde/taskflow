using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace TaskFlow.Api
{
    public class SwaggerFileOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var consumesAttribute = context.MethodInfo.GetCustomAttributes(true)
                .OfType<ConsumesAttribute>()
                .FirstOrDefault();

            if (consumesAttribute == null || !consumesAttribute.ContentTypes.Contains("multipart/form-data"))
                return;

            var fileParameters = context.ApiDescription.ParameterDescriptions
                .Where(p => p.ModelMetadata?.ModelType == typeof(IFormFile))
                .ToList();

            if (!fileParameters.Any())
                return;

            operation.Parameters.Clear();

            var properties = new Dictionary<string, OpenApiSchema>();
            var requiredFields = new HashSet<string>();

            foreach (var param in fileParameters)
            {
                properties.Add(param.Name, new OpenApiSchema
                {
                    Type = "string",
                    Format = "binary"
                });
                requiredFields.Add(param.Name);
            }

            operation.RequestBody = new OpenApiRequestBody
            {
                Required = true,
                Content = new Dictionary<string, OpenApiMediaType>
                {
                    ["multipart/form-data"] = new OpenApiMediaType
                    {
                        Schema = new OpenApiSchema
                        {
                            Type = "object",
                            Properties = properties,
                            Required = requiredFields
                        }
                    }
                }
            };
        }
    }
}
