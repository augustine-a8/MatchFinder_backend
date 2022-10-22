export const createMatch = `
    mutation($createMatchInput: CreateMatchInput!) {
        createMatch(createMatchInput: $createMatchInput) {
            id ageL ageH gender
        }
    }
`;

export const updateMatch = `
    mutation($matchId: ID!, $updateMatchInput: CreateMatchInput!) {
        updateMatch(matchId: $matchId, updateMatchInput: $updateMatchInput) {
            id ageL ageH gender
        }
    }
`;
