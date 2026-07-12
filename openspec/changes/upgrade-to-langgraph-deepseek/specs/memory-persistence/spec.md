## ADDED Requirements

### Requirement: Memory SQLite persistence
The system SHALL persist all memory records to SQLite database.

#### Scenario: Memory saved
- **WHEN** a new memory is created
- **THEN** it is saved to the database

#### Scenario: Memory loaded
- **WHEN** the application starts
- **THEN** memories are loaded from the database

### Requirement: Time-weighted memory retrieval
The system SHALL retrieve memories with time-weighted scoring.

#### Scenario: Recent memory prioritized
- **WHEN** retrieving memories
- **THEN** recent memories have higher weight in scoring

#### Scenario: Important memory prioritized
- **WHEN** retrieving memories
- **THEN** memories marked as important have higher weight

### Requirement: Short-term and long-term memory separation
The system SHALL maintain separate short-term and long-term memory stores.

#### Scenario: Short-term memory
- **WHEN** new experiences occur
- **THEN** they are stored in short-term memory (max 20 items)

#### Scenario: Long-term memory
- **WHEN** memory is marked important
- **THEN** it is promoted to long-term memory (max 100 items)

### Requirement: Memory reflection summary
The system SHALL generate reflection summaries from recent memories.

#### Scenario: Daily reflection
- **WHEN** reflection is triggered
- **THEN** the system extracts top 5 important memories and generates summary

#### Scenario: Memory pruning
- **WHEN** memory count exceeds limits
- **THEN** oldest memories are pruned based on time-weighted score
