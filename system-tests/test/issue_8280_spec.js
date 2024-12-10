const { fs } = require('@packages/server/lib/util/fs')
const Fixtures = require('../lib/fixtures')
const systemTests = require('../lib/system-tests').default

const PROJECT_NAME = 'issue-8280-retain-video'

describe('e2e issue 8280', () => {
  systemTests.setup()

  // https://github.com/cypress-io/cypress/issues/8280

  it('should retain the videos from previous runs if trashAssetsBeforeRuns=false', function () {
    return systemTests.exec(this, {
      project: PROJECT_NAME,
      snapshot: false,
      expectedExitCode: 2,
      processEnv: {
        'CYPRESS_trashAssetsBeforeRuns': 'false',
      },
    })
    .then(() => {
      return systemTests.exec(this, {
        project: PROJECT_NAME,
        snapshot: false,
        expectedExitCode: 2,
        processEnv: {
          'CYPRESS_trashAssetsBeforeRuns': 'false',
        },
      })
    }).then(() => {
      return fs.readdir(Fixtures.projectPath(`${PROJECT_NAME}/cypress/screenshots/spec1.cy.js`))
    }).then((screenshots) => {
      expect(screenshots.length).to.eq(2)
      expect(screenshots).to.include('spec1 -- testCase1 (failed).png')
      expect(screenshots).to.include('spec1 -- testCase1 (failed) (1).png')
    }).then(() => {
      return fs.readdir(Fixtures.projectPath(`${PROJECT_NAME}/cypress/screenshots/spec2.cy.js`))
    }).then((screenshots) => {
      expect(screenshots.length).to.eq(2)
      expect(screenshots).to.include('spec2 -- testCase1 (failed).png')
      expect(screenshots).to.include('spec2 -- testCase1 (failed) (1).png')
    })
    .then(() => {
      return fs.readdir(Fixtures.projectPath(`${PROJECT_NAME}/cypress/videos`))
    }).then((videos) => {
      expect(videos.length).to.eq(4)
      expect(videos).to.include('spec1.cy.js.mp4')
      expect(videos).to.include('spec1.cy.js (1).mp4')
      expect(videos).to.include('spec2.cy.js.mp4')
      expect(videos).to.include('spec2.cy.js (1).mp4')
    })
  })

  // if trash assets = true, then there will be no retention of screenshots or videos
  it('should not retain the videos from previous runs if trashAssetsBeforeRuns=true', function () {
    return systemTests.exec(this, {
      project: PROJECT_NAME,
      snapshot: false,
      expectedExitCode: 2,
      processEnv: {
        'CYPRESS_trashAssetsBeforeRuns': 'true',
      },
    })
    .then(() => {
      return systemTests.exec(this, {
        project: PROJECT_NAME,
        snapshot: false,
        expectedExitCode: 2,
        processEnv: {
          'CYPRESS_trashAssetsBeforeRuns': 'true',
        },
      })
    }).then(() => {
      return fs.readdir(Fixtures.projectPath(`${PROJECT_NAME}/cypress/screenshots/spec1.cy.js`))
    }).then((screenshots) => {
      expect(screenshots.length).to.eq(1)
      expect(screenshots).to.include('spec1 -- testCase1 (failed).png')
    }).then(() => {
      return fs.readdir(Fixtures.projectPath(`${PROJECT_NAME}/cypress/screenshots/spec2.cy.js`))
    }).then((screenshots) => {
      expect(screenshots.length).to.eq(1)
      expect(screenshots).to.include('spec2 -- testCase1 (failed).png')
    }).then(() => {
      return fs.readdir(Fixtures.projectPath(`${PROJECT_NAME}/cypress/videos`))
    }).then((videos) => {
      expect(videos.length).to.eq(2)
      expect(videos).to.include('spec1.cy.js.mp4')
      expect(videos).to.include('spec2.cy.js.mp4')
    })
  })
})
