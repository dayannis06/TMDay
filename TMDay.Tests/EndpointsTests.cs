using System.Text;
using System.Text.Json;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;
using Microsoft.AspNetCore.Mvc.Testing;
using FluentAssertions;

namespace TMDay.Tests;

public class EndpointsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient client;
    public EndpointsTests(WebApplicationFactory<Program> factory)
    {
        client = factory.CreateClient();
    }
    // Helper method to create a test case and return its ID
        public async Task<int> Create_TestCase_Async()
    {
        var newTestCase = new
        {
            TcName = "New Test Case",
            TcEpic = "New Epic",
            TcApp = "New App",
            TcComponent = "New Component",
            TcStory = "New Story",
            TcAssigned = "New Assigned",
            CreatedAt = DateTime.UtcNow
        };
        var json = JsonSerializer.Serialize(newTestCase);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await client.PostAsync("/testcase", content);
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var responseContent = await response.Content.ReadAsStringAsync();
        using var jsonDoc = JsonDocument.Parse(responseContent);
        return jsonDoc.RootElement.GetProperty("tcId").GetInt32();
    }

     [Fact]
    public async Task Create_TestCase_ReturnsCreated()
    {
        // Arrange
        var newTestCase = new
        {
            TcName = "New Test Case",
            TcEpic = "New Epic",
            TcApp = "New App",
            TcComponent = "New Component",
            TcStory = "New Story",
            TcAssigned = "New Assigned",
            CreatedAt = DateTime.UtcNow
        };
        // Act
        var json = JsonSerializer.Serialize(newTestCase);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await client.PostAsync("/testcase", content);
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }
    [Fact]
    public async Task Get_AllTestCases_ReturnsOk()
    {
        // Act
        var response = await client.GetAsync("/testcase");
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
    [Fact]
    public async Task Get_TestCaseById_ReturnsOk()
    {
        // Arrange
        int testCaseId = await Create_TestCase_Async();
        // Act
        var response = await client.GetAsync($"/testcase/{testCaseId}");
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
    [Fact]
    public async Task Get_TestCaseById_ReturnsNotFound()
    {
        // Arrange
        int testCaseId = 999;
        // Act
        var response = await client.GetAsync($"/testcase/{testCaseId}");
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
    [Fact]
    public async Task Get_TestCaseByName_ReturnsOk()
    {
        // Arrange
        int testCaseId = await Create_TestCase_Async();
        var response = await client.GetAsync($"/testcase/{testCaseId}");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var responseContent = await response.Content.ReadAsStringAsync();
        using var jsonDoc = JsonDocument.Parse(responseContent);
        string testCaseName = jsonDoc.RootElement.GetProperty("tcName").GetString();
        // Act
        var searchResponse = await client.GetAsync($"/testcase/search-by-name?filter={testCaseName}");
        // Assert
        searchResponse.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Update_TestCase_ReturnsOk()
    {
        // Arrange
        int testCaseId = await Create_TestCase_Async();
        var updatedTestCase = new
        {
            TcName = "Updated Test Case",
            TcEpic = "Updated Epic",
            TcApp = "Updated App",
            TcComponent = "Updated Component",
            TcStory = "Updated Story",
            TcAssigned = "Updated Assigned",
            UpdatedAt = DateTime.UtcNow
        };
        // Act
        var json = JsonSerializer.Serialize(updatedTestCase);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await client.PutAsync($"/testcase/{testCaseId}", content);
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    } 
    [Fact]
    public async Task Update_TestCase_ReturnsNotFound()
    {
        // Arrange
        int testCaseId = 999;
        var updatedTestCase = new
        {
            TcName = "Updated Test Case",
            TcEpic = "Updated Epic",
            TcApp = "Updated App",
            TcComponent = "Updated Component",
            TcStory = "Updated Story",
            TcAssigned = "Updated Assigned",
            UpdatedAt = DateTime.UtcNow
        };
        // Act
        var json = JsonSerializer.Serialize(updatedTestCase);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await client.PutAsync($"/testcase/{testCaseId}", content);
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
    [Fact]
    public async Task Delete_TestCase_ReturnsNotFound()
    {   
        // Arrange
        int testCaseId = 999;
        // Act
        var response = await client.DeleteAsync($"/testcase/{testCaseId}");
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
    [Fact]
    public async Task Delete_TestCase_ReturnsOk()
    {    
        // Arrange
        int testCaseId = await Create_TestCase_Async();
        // Act
        var response = await client.DeleteAsync($"/testcase/{testCaseId}");
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }
    [Fact]
    public async Task Create_TestCasesScenario_ReturnsOk()
    {
        // Arrange
        int testCaseId = await Create_TestCase_Async();
        var newScenario = new
        {
            Name = "updatedScenario",
            PreRequisites = "updatedScenario.PreRequisites",
            Data = "updatedScenario.Data",
            Steps = "updatedScenario.Steps",
            ExpectedResult = "updatedScenario.ExpectedResult",
            ActualResult = "updatedScenario.ActualResult",
            Status = "ToDo",
            Type = "Functional"
        };
        // Act
        var json = JsonSerializer.Serialize(newScenario);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await client.PostAsync($"/testcase/{testCaseId}/scenario", content);
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }
        [Fact]
    public async Task Create_TestCasesScenario_ReturnsNotFound()
    {
        // Arrange
        int testCaseId = 999;
        var newScenario = new
        {
            Name = "updatedScenario",
            PreRequisites = "updatedScenario.PreRequisites",
            Data = "updatedScenario.Data",
            Steps = "updatedScenario.Steps",
            ExpectedResult = "updatedScenario.ExpectedResult",
            ActualResult = "updatedScenario.ActualResult",
            Status = "ToDo",
            Type = "Functional"
        };
        // Act
        var json = JsonSerializer.Serialize(newScenario);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await client.PostAsync($"/testcase/{testCaseId}/scenario", content);
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);   
    }
        [Fact]
        public async Task Delete_TestCasesScenario_ReturnsNotFound()
    {        // Arrange
        int testCaseId = await Create_TestCase_Async();
        int scenarioId = 999;
        // Act
        var response = await client.DeleteAsync($"/testcase/{testCaseId}/scenario/{scenarioId}");
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
    [Fact]
    public async Task Delete_TestCasesScenario_ReturnsOk()
    {        // Arrange
        int testCaseId = await Create_TestCase_Async();
        var newScenario = new
        {
            Name = "updatedScenario",
            PreRequisites = "updatedScenario.PreRequisites",
            Data = "updatedScenario.Data",
            Steps = "updatedScenario.Steps",
            ExpectedResult = "updatedScenario.ExpectedResult",
            ActualResult = "updatedScenario.ActualResult",
            Status = "ToDo",
            Type = "Functional"
        };
        var json = JsonSerializer.Serialize(newScenario);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");
        var createResponse = await client.PostAsync($"/testcase/{testCaseId}/scenario", content);
        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var responseContent = await createResponse.Content.ReadAsStringAsync();
        using var jsonDoc = JsonDocument.Parse(responseContent);
        int scenarioId = jsonDoc.RootElement.GetProperty("id").GetInt32();
        // Act
        var response = await client.DeleteAsync($"/testcase/{testCaseId}/scenario/{scenarioId}");
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }
        [Fact]
        public async Task Update_TestCasesScenario_ReturnsNotFound()
    {        // Arrange
        int testCaseId = await Create_TestCase_Async();
        int scenarioId = 999;
        var updatedScenario = new
        {
            Name = "updatedScenario",
            PreRequisites = "updatedScenario.PreRequisites",
            Data = "updatedScenario.Data",
            Steps = "updatedScenario.Steps",
            ExpectedResult = "updatedScenario.ExpectedResult",
            ActualResult = "updatedScenario.ActualResult",
            Status = "ToDo",
            Type = "Functional"
        };
        // Act
        var json = JsonSerializer.Serialize(updatedScenario);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await client.PutAsync($"/testcase/{testCaseId}/scenario/{scenarioId}", content);
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
    [Fact]
    public async Task Update_TestCasesScenario_ReturnsOk()
    {        // Arrange
        int testCaseId = await Create_TestCase_Async();
        var newScenario = new
        {
            Name = "updatedScenario",
            PreRequisites = "updatedScenario.PreRequisites",
            Data = "updatedScenario.Data",
            Steps = "updatedScenario.Steps",
            ExpectedResult = "updatedScenario.ExpectedResult",
            ActualResult = "updatedScenario.ActualResult",
            Status = "ToDo",
            Type = "Functional"
        };
        var json = JsonSerializer.Serialize(newScenario);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");
        var createResponse = await client.PostAsync($"/testcase/{testCaseId}/scenario", content);
        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var responseContent = await createResponse.Content.ReadAsStringAsync();
        using var jsonDoc = JsonDocument.Parse(responseContent);
        int scenarioId = jsonDoc.RootElement.GetProperty("id").GetInt32();
        var updatedScenario = new
        {
            Name = "updatedScenario",
            PreRequisites = "updatedScenario.PreRequisites",
            Data = "updatedScenario.Data",
            Steps = "updatedScenario.Steps",
            ExpectedResult = "updatedScenario.ExpectedResult",
            ActualResult = "updatedScenario.ActualResult",
            Status = "InProgress",
            Type = "Regression"
        };
        // Act
        var updatedJson = JsonSerializer.Serialize(updatedScenario);
        using var updatedContent = new StringContent(updatedJson, Encoding.UTF8, "application/json");
        var response = await client.PutAsync($"/testcase/{testCaseId}/scenario/{scenarioId}", updatedContent);
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }
    [Fact]
    public async Task Get_Enums_ReturnsOk()
    {
        // Act
        var response = await client.GetAsync("/testcase/enums");
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

}
