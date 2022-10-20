export const createProfile = `
    mutation($createProfileInput: CreateProfileInput!) {
        createProfile(createProfileInput: $createProfileInput) {
            id age username gender
        }
    }
`;

export const updateProfile = `
    mutation($profileId: ID!, $updateProfileInput: CreateProfileInput!) {
        updateProfile(profileId: $profileId, updateProfileInput: $updateProfileInput) {
            id age username gender
        }
    }
`;

export const getProfile = `
    query($profileId: ID!) {
        getProfile(profileId: $profileId) {
            id age username gender
        }
    }
`;
