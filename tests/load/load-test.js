import http from 'k6/http';
import { check, sleep } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

export const options = {
    stages: [
        { duration: '1m', target: 100 }, // 100 VUs over 1 minute
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
        http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
    },
};

const BASE_URL = 'https://api.cubosapiens.world';

export default function () {
    const endpoints = [
        { name: 'Health Check', url: '/' },
        { name: 'Tools API', url: '/api/tools' },
        { name: 'Games API', url: '/api/games' },
        { name: 'Counter API', url: '/api/counter' },
    ];

    for (const endpoint of endpoints) {
        const res = http.get(`${BASE_URL}${endpoint.url}`, {
            tags: { name: endpoint.name },
        });

        check(res, {
            'status is 200': (r) => r.status === 200,
        });
        
        sleep(0.1); // Small sleep between requests
    }
    
    sleep(1); // Sleep for VU iteration
}

export function handleSummary(data) {
    return {
        'reports/k6-summary.json': JSON.stringify(data, null, 2),
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    };
}
