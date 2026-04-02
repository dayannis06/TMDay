using System.Text.Json;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using TMDay.API.Models;
using System.Text.Json.Serialization;

namespace TMDay.API.Controllers
{
    [ApiController]
    [Route("testcase")]
    public class TestCasesController : ControllerBase
    {
        private readonly TMDay.API.Services.TestCasesService testCasesService;
        private List<TestCases> testCases;

        public TestCasesController(TMDay.API.Services.TestCasesService testCasesService)
        {
            this.testCasesService = testCasesService;
            testCases = testCasesService.LoadTestCases();
        }

        private void SaveTestCasesToFile()
        {
            testCasesService.SaveTestCases(testCases);
        }

        // GET /testcase
        [HttpGet]
        public ActionResult<TestCases> GetAllTestCases()
        {
            return Ok(testCases);
        }

        // GET /testcase/{id}
        [HttpGet("{id}")]
        public ActionResult<TestCases> GetTestCaseById(int id)
        {
            var testCase = testCases.FirstOrDefault(tc => tc.TcId == id);
            if (testCase == null)
            {
                return NotFound();
            }
            return Ok(testCase);
        }

        // GET /testcase/search-by-name?filter=someName
        [HttpGet("search-by-name")]
        public ActionResult<List<TestCases>> SearchTestCases([FromQuery] string? filter)
        {
            if (string.IsNullOrWhiteSpace(filter))
            {
                return Ok(testCases);
            }
            var filteredTestCases = testCases.Where(tc =>
                !string.IsNullOrEmpty(tc.TcName) &&
                     tc.TcName.Trim().ToLower().Contains(filter.Trim().ToLower()))
                       .ToList();
            return Ok(filteredTestCases);
        }

        // PUT /testcase/{id}
        [HttpPut("{id}")]
        public ActionResult UpdateTestCase(int id, TestCases updatedTestCase)
        {
            var testCase = testCases.FirstOrDefault(tc => tc.TcId == id);
            if (testCase == null)
            {
                return NotFound();
            }
            testCase.TcName = updatedTestCase.TcName;
            testCase.TcEpic = updatedTestCase.TcEpic;
            testCase.TcApp = updatedTestCase.TcApp;
            testCase.TcComponent = updatedTestCase.TcComponent;
            testCase.TcStory = updatedTestCase.TcStory;
            testCase.TcAssigned = updatedTestCase.TcAssigned;
            testCase.CreatedAt = DateTime.UtcNow;

            SaveTestCasesToFile();

            return NoContent();
        }
        // PUT /testcase/{id}/scenario/{scenarioId}
        [HttpPut("{id}/scenario/{scenarioId}")]
        public ActionResult UpdateTestScenario(int id, int scenarioId, TestScenarios updatedScenario)
        {
            var testCase = testCases.FirstOrDefault(tc => tc.TcId == id);
            if (testCase == null)
            {
                return NotFound();
            }

            var scenario = testCase.TestScenarios.FirstOrDefault(s => s.Id == scenarioId);
            if (scenario == null)
            {
                return NotFound();
            }

            scenario.Name = updatedScenario.Name;
            scenario.PreRequisites = updatedScenario.PreRequisites;
            scenario.Data = updatedScenario.Data;
            scenario.Steps = updatedScenario.Steps;
            scenario.ExpectedResult = updatedScenario.ExpectedResult;
            scenario.ActualResult = updatedScenario.ActualResult;
            scenario.Status = updatedScenario.Status;
            scenario.Type = updatedScenario.Type;

            SaveTestCasesToFile();

            return NoContent();
        }
        // POST /testcase
        [HttpPost]
        public ActionResult CreateTestCase(TestCases newTestCase)
        {
            int lastId = testCases.OrderByDescending(tc => tc.TcId)
                                  .Select(tc => tc.TcId)
                                  .FirstOrDefault();
            int newId = lastId + 1;
            newTestCase.TcId = newId;
            newTestCase.CreatedAt = DateTime.UtcNow;
            testCases.Add(newTestCase);

            SaveTestCasesToFile();
            return CreatedAtAction(nameof(GetTestCaseById), new { id = newTestCase.TcId }, newTestCase);
        }
        // POST /testcase/{id}/scenario
        [HttpPost("{id}/scenario")]
        public ActionResult CreateTestScenario(int id, TestScenarios newScenario)
        {
            var testCase = testCases.FirstOrDefault(tc => tc.TcId == id);
            if (testCase == null)
            {
                return NotFound();
            }

            int lastScenarioId = testCase.TestScenarios.OrderByDescending(s => s.Id)
                                                        .Select(s => s.Id)
                                                        .FirstOrDefault();
            int newScenarioId = lastScenarioId + 1;
            newScenario.Id = newScenarioId;
            newScenario.TcId = id;
            testCase.TestScenarios.Add(newScenario);

            SaveTestCasesToFile();

            return CreatedAtAction(nameof(GetTestCaseById), new { id = testCase.TcId }, newScenario);
        }
        // DELETE /testcase/{id}
        [HttpDelete("{id}")]
        public ActionResult DeleteTestCase(int id)
        {   
            var testCase = testCases.FirstOrDefault(tc => tc.TcId == id);
            if (testCase == null) 
            {
                return NotFound();
            }
            testCase.TestScenarios.Clear();
            testCases.Remove(testCase);

            SaveTestCasesToFile();

            return NoContent();
        }
        // DELETE /testcase/{id}/scenario/{scenarioId}
        [HttpDelete("{id}/scenario/{scenarioId}")]
        public ActionResult DeleteTestScenario(int id, int scenarioId)
        {   
            var testCase = testCases.FirstOrDefault(tc => tc.TcId == id);
            if (testCase == null)
            {
                return NotFound(); 
            }
            var scenario = testCase.TestScenarios.FirstOrDefault(s => s.Id == scenarioId);
            if (scenario == null)
            {
                return NotFound();
            }
            testCase.TestScenarios.Remove(scenario);

            SaveTestCasesToFile();

            return NoContent();
        }
        // GET /testcase/{id}/progress
        [HttpGet("{id}/progress")]
        public ActionResult<List<ProgressItem>> GetTestCasesProgress(int id)
        {
            var testCase = testCases.FirstOrDefault(tc => tc.TcId == id);
            if (testCase == null)
            {
                return NotFound();
            }

            var progress = ProgressCalculator.CalculateProgress(testCase.TestScenarios);
            return Ok(progress);
        }
        // GET /testcase/enums
        [HttpGet("enums")]
        public ActionResult GetEnums()
        {
            return Ok(new
            {
                TestScenarioTypes = Enum.GetValues(typeof(ScenarioTypes)),
                TestScenarioStatuses = Enum.GetValues(typeof(Status))
            });
        }
    }
}
