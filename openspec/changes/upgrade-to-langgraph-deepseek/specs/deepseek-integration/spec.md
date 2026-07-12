## ADDED Requirements

### Requirement: DeepSeek API configuration
The system SHALL read DEEPSEEK_API_KEY and DEEPSEEK_BASE_URL from environment variables.

#### Scenario: API key configured
- **WHEN** .env contains valid DEEPSEEK_API_KEY
- **THEN** API calls use the configured key

#### Scenario: API key missing
- **WHEN** .env does not contain DEEPSEEK_API_KEY
- **THEN** the system falls back to rule-based decision making

### Requirement: DeepSeek API call wrapper
The system SHALL use langchain_openai.ChatOpenAI compatible mode to call DeepSeek API.

#### Scenario: Planner Agent API call
- **WHEN** Planner Agent needs to make a decision
- **THEN** it calls DeepSeek API with pet state and memory context

#### Scenario: Reflection Agent API call
- **WHEN** Reflection Agent needs to summarize the day
- **THEN** it calls DeepSeek API with today's experiences

#### Scenario: Narrative Agent API call
- **WHEN** Narrative Agent needs to generate diary
- **THEN** it calls DeepSeek API with reflection and memory data

### Requirement: API timeout and retry
The system SHALL implement exponential backoff retry for API calls.

#### Scenario: API timeout
- **WHEN** API call times out
- **THEN** the system retries with exponential backoff

#### Scenario: API failure
- **WHEN** API fails after retries
- **THEN** the system falls back to rule-based processing

### Requirement: JSON output parsing
The system SHALL parse API responses and extract structured JSON output.

#### Scenario: Successful JSON parsing
- **WHEN** API returns valid JSON response
- **THEN** the system parses it into structured data

#### Scenario: JSON parsing failure
- **WHEN** API returns invalid JSON
- **THEN** the system logs the error and uses fallback logic
