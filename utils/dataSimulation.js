const { faker } = require('@faker-js/faker');

exports.generateMockMembers = () => {
  // Generate mock data for members
  const mockMembers = [];
  for (let i = 0; i < 100; i++) {
    mockMembers.push({
      username: faker.internet.userName(),
      joinDate: faker.date.past(),
      isActive: faker.random.boolean(),
    });
  }
  return mockMembers;
};

// Additional mock data generation functions can go here
