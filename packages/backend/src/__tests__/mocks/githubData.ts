export const mockOpenedPRGithubPayload = {
  action: 'opened',
  pull_request: {
    title: 'Update README.md [2]',
    merged: false,
  },
  repository: {
    clone_url: 'https://github.com/Project-Trofos/trofos.git',
  },
};

export const mockMergedPRGithubPayload = {
  action: 'closed',
  pull_request: {
    title: 'Update README.md [2]',
    merged: true,
  },
  repository: {
    clone_url: 'https://github.com/Project-Trofos/trofos.git',
  },
};
