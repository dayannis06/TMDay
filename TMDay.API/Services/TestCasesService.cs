using System.Text.Json;
using System.Text.Json.Serialization;
using TMDay.API.Models;

namespace TMDay.API.Services
{
    public class TestCasesService
    {
        private readonly string jsonPath = "./Resources/testdata.json";
        private readonly JsonSerializerOptions options;

        public TestCasesService()
        {
            options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                WriteIndented = true
            };
            options.Converters.Add(new JsonStringEnumConverter());
        }

        public List<TestCases> LoadTestCases()
        {
            if (!System.IO.File.Exists(jsonPath))
                return new List<TestCases>();

            var jsonFile = System.IO.File.ReadAllText(jsonPath);
            var testDataWrapper = JsonSerializer.Deserialize<TestDataWrapper>(jsonFile, options);
            return testDataWrapper?.TestCases ?? new List<TestCases>();
        }

        public void SaveTestCases(List<TestCases> testCases)
        {
            var json = JsonSerializer.Serialize(new { TestCases = testCases }, options);
            System.IO.File.WriteAllText(jsonPath, json);
        }
    }
}
