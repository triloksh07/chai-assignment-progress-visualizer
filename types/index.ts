// types/index.ts

export interface ClassroomRepo {
    id: number;
    name: string;
    fullName: string;
    url: string;
    updatedAt: string;
    isManual?: boolean;
}

export interface GitHubRepoResponse {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    updated_at: string;
}

export interface AutogradingTest {
    name: string;
    setup: string;
    run: string;
    timeout: number;
    points: number;
}

export interface AutogradingConfig {
    tests: AutogradingTest[];
}

export interface TestResult {
    test: string;
    earned: number;
    max: number;
    status: 'passed' | 'failed' | 'pending';
}

export interface ProgressData {
    results: TestResult[];
    totalEarned: number;
    totalMax: number;
    commit: string;
}