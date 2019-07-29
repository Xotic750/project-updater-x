const readlineSync = require('readline-sync');
const fs = require('fs');
const path = require('path');
const shelljs = require('shelljs');
const SemVer = require('semver');
const GitHub = require('github-api');
const Haikunator = require('haikunator');
const cloneDeep = require('lodash/cloneDeep');
const Promise = require('bluebird');
const templatePackage = require('../template/package.json');

const SemVerLevel = 'patch';
const CONTINUE_FROM = fs.existsSync(path.resolve('last.json')) ? require('../last.json').name : '';

if (CONTINUE_FROM) {
  console.log(`Continuing from: ${CONTINUE_FROM}`);
}

const UPDATE_README = false;

const CHECK_PROJECTS_ONLY = false;

/**
 * The temporary work directory.
 *
 * @type {string}
 * */
const TMP = 'tmp';

/**
 * GitHub repo prefix.
 *
 * @type {string}
 * */
const GITHUB_REPO_PREFIX = 'Xotic750';

/**
 * The prefix to use with GitHub, clone and push.
 *
 * @type {string}
 * */
const GITHUB_URL_PREFIX = `git@github.com:${GITHUB_REPO_PREFIX}`;

/**
 * List of the package.json keys to be written and their order.
 *
 * @type {Array<string>}
 */
const packageKeyOrder = [
  'name',
  'version',
  'description',
  'homepage',
  'author',
  'copyright',
  'keywords',
  'files',
  'module',
  'main',
  'jsdelivr',
  'bin',
  'scripts',
  'license',
  'repository',
  'bugs',
  'dependencies',
  'devDependencies',
  'engines',
  'browserslist',
];

/**
 * The projects and their order of execution.
 *
 * @type {Array<object>}
 */
const projects = [
  {
    name: 'module-boilerplate-x',
    identifier: SemVerLevel,
    dependenciesCount: 0,
  },
  {
    name: 'nan-x',
    identifier: SemVerLevel,
    dependenciesCount: 0,
  },
  {
    name: 'infinity-x',
    identifier: SemVerLevel,
    dependenciesCount: 0,
  },
  {
    name: 'cached-constructors-x',
    identifier: SemVerLevel,
    dependenciesCount: 0,
  },
  {
    name: 'has-boxed-string-x',
    identifier: SemVerLevel,
    dependenciesCount: 0,
  },
  {
    name: 'has-reflect-support-x',
    identifier: SemVerLevel,
    dependenciesCount: 0,
  },
  {
    name: 'is-nan-x',
    identifier: SemVerLevel,
    dependenciesCount: 0,
  },
  {
    name: 'modulo-x',
    identifier: SemVerLevel,
    dependenciesCount: 0,
  },
  {
    name: 'is-nil-x',
    identifier: SemVerLevel,
    dependenciesCount: 0,
  },
  {
    name: 'to-boolean-x',
    identifier: SemVerLevel,
    dependenciesCount: 0,
  },
  {
    name: 'is-node-x',
    identifier: SemVerLevel,
    dependenciesCount: 0,
  },
  {
    name: 'attempt-x',
    identifier: SemVerLevel,
    dependenciesCount: 0,
  },
  {
    name: 'to-string-tag-x',
    identifier: SemVerLevel,
    dependenciesCount: 0,
  },
  {
    name: 'white-space-x',
    identifier: SemVerLevel,
    dependenciesCount: 0,
  },
  {
    name: 'same-value-x',
    identifier: SemVerLevel,
    dependenciesCount: 1,
  },
  {
    name: 'same-value-zero-x',
    identifier: SemVerLevel,
    dependenciesCount: 1,
  },
  {
    name: 'to-string-x',
    identifier: SemVerLevel,
    dependenciesCount: 1,
  },
  {
    name: 'require-object-coercible-x',
    identifier: SemVerLevel,
    dependenciesCount: 1,
  },
  {
    name: 'require-coercible-to-string-x',
    identifier: SemVerLevel,
    dependenciesCount: 2,
  },
  {
    name: 'regexp-escape-x',
    identifier: SemVerLevel,
    dependenciesCount: 1,
  },
  {
    name: 'is-falsey-x',
    identifier: SemVerLevel,
    dependenciesCount: 1,
  },
  {
    name: 'is-truthy-x',
    identifier: SemVerLevel,
    dependenciesCount: 1,
  },
  {
    name: 'is-surrogate-pair-x',
    identifier: SemVerLevel,
    dependenciesCount: 1,
  },
  {
    name: 'is-finite-x',
    identifier: SemVerLevel,
    dependenciesCount: 2,
  },
  {
    name: 'trim-left-x',
    identifier: SemVerLevel,
    dependenciesCount: 2,
  },
  {
    name: 'trim-right-x',
    identifier: SemVerLevel,
    dependenciesCount: 2,
  },
  {
    name: 'trim-x',
    identifier: SemVerLevel,
    dependenciesCount: 2,
  },
  {
    name: 'parse-int-x',
    identifier: SemVerLevel,
    dependenciesCount: 3,
  },
  {
    name: 'has-symbol-support-x',
    identifier: SemVerLevel,
    dependenciesCount: 2,
  },
  {
    name: 'has-to-string-tag-x',
    identifier: SemVerLevel,
    dependenciesCount: 2,
  },
  {
    name: 'normalize-space-x',
    identifier: SemVerLevel,
    dependenciesCount: 2,
  },
  {
    name: 'replace-comments-x',
    identifier: SemVerLevel,
    dependenciesCount: 2,
  },
  {
    name: 'is-function-x',
    identifier: SemVerLevel,
    dependenciesCount: 8,
  },
  {
    name: 'to-primitive-x',
    identifier: SemVerLevel,
    dependenciesCount: 7,
  },
  {
    name: 'to-number-x',
    identifier: SemVerLevel,
    dependenciesCount: 5,
  },
  {
    name: 'math-sign-x',
    identifier: SemVerLevel,
    dependenciesCount: 2,
  },
  {
    name: 'to-integer-x',
    identifier: SemVerLevel,
    dependenciesCount: 4,
  },
  {
    name: 'is-integer-x',
    identifier: SemVerLevel,
    dependenciesCount: 2,
  },
  {
    name: 'is-safe-integer-x',
    identifier: SemVerLevel,
    dependenciesCount: 2,
  },
  {
    name: 'is-length-x',
    identifier: SemVerLevel,
    dependenciesCount: 1,
  },
  {
    name: 'math-clamp-x',
    identifier: SemVerLevel,
    dependenciesCount: 1,
  },
  {
    name: 'math-trunc-x',
    identifier: SemVerLevel,
    dependenciesCount: 1,
  },
  {
    name: 'to-safe-integer-x',
    identifier: SemVerLevel,
    dependenciesCount: 2,
  },
  {
    name: 'delay-promise-x',
    identifier: SemVerLevel,
    regenerator: true,
    dependencyClashes: ['lodash'],
    dependenciesCount: 1,
  },
  {
    name: 'is-object-like-x',
    identifier: SemVerLevel,
    dependenciesCount: 2,
  },
  {
    name: 'to-string-symbols-supported-x',
    identifier: SemVerLevel,
    dependenciesCount: 2,
  },
  {
    name: 'split-if-boxed-bug-x',
    identifier: SemVerLevel,
    dependenciesCount: 2,
  },
  {
    name: 'to-length-x',
    identifier: SemVerLevel,
    dependenciesCount: 2,
  },
  {
    name: 'to-object-x',
    identifier: SemVerLevel,
    dependenciesCount: 2,
  },
  {
    name: 'array-like-slice-x',
    identifier: SemVerLevel,
    dependenciesCount: 5,
  },
  {
    name: 'is-array-x',
    identifier: SemVerLevel,
    dependenciesCount: 2,
  },
  {
    name: 'array-slice-x',
    identifier: SemVerLevel,
    dependenciesCount: 7,
  },
  {
    name: 'shuffle-x',
    identifier: SemVerLevel,
    dependenciesCount: 2,
  },
  {
    name: 'number-to-decimal-form-string-x',
    identifier: SemVerLevel,
    dependenciesCount: 2,
  },
  {
    name: 'string-quote-x',
    identifier: SemVerLevel,
    dependenciesCount: 2,
  },
  {
    name: 'assert-is-object-x',
    identifier: SemVerLevel,
    dependenciesCount: 2,
  },
  {
    name: 'to-property-key-x',
    identifier: SemVerLevel,
    dependenciesCount: 3,
  },
  {
    name: 'property-is-enumerable-x',
    identifier: SemVerLevel,
    dependenciesCount: 2,
  },
  {
    name: 'assert-is-function-x',
    identifier: SemVerLevel,
    dependenciesCount: 3,
  },
  {
    name: 'array-map-x',
    identifier: SemVerLevel,
    dependenciesCount: 7,
  },
  {
    name: 'array-every-x',
    identifier: SemVerLevel,
    dependenciesCount: 7,
  },
  {
    name: 'array-filter-x',
    identifier: SemVerLevel,
    dependenciesCount: 7,
  },
  {
    name: 'array-for-each-x',
    identifier: SemVerLevel,
    dependenciesCount: 7,
  },
  {
    name: 'is-array-like-x',
    identifier: SemVerLevel,
    dependenciesCount: 3,
  },
  {
    name: 'power-set-x',
    identifier: SemVerLevel,
    dependenciesCount: 3,
  },
  {
    name: 'get-prototype-of-x',
    identifier: SemVerLevel,
    dependenciesCount: 4,
  },
  {
    name: 'is-error-x',
    identifier: SemVerLevel,
    dependenciesCount: 3,
  },
  {
    name: 'has-own-property-x',
    identifier: SemVerLevel,
    dependenciesCount: 3,
  },
  {
    name: 'get-own-property-symbols-x',
    identifier: SemVerLevel,
    dependenciesCount: 3,
  },
  {
    name: 'get-own-enumerable-property-symbols-x',
    identifier: SemVerLevel,
    dependenciesCount: 4,
  },
  {
    name: 'object-define-property-x',
    identifier: SemVerLevel,
    dependenciesCount: 9,
  },
  {
    name: 'is-index-x',
    identifier: SemVerLevel,
    dependenciesCount: 5,
  },
  {
    name: 'object-get-own-property-descriptor-x',
    identifier: SemVerLevel,
    dependenciesCount: 10,
  },
  {
    name: 'is-regexp-x',
    identifier: SemVerLevel,
    dependenciesCount: 6,
  },
  {
    name: 'object-keys-x',
    identifier: SemVerLevel,
    dependenciesCount: 10,
  },
  {
    name: 'get-own-enumerable-keys-x',
    identifier: SemVerLevel,
    dependenciesCount: 3,
  },
  {
    name: 'string-pad-start-x',
    identifier: SemVerLevel,
    dependenciesCount: 4,
  },
  {
    name: 'to-uint-24-x',
    identifier: SemVerLevel,
    dependenciesCount: 4,
  },
  {
    name: 'int-to-rgb-x',
    identifier: SemVerLevel,
    dependenciesCount: 3,
  },
  {
    name: 'calculate-from-index-x',
    identifier: SemVerLevel,
    dependenciesCount: 4,
  },
  {
    name: 'find-index-x',
    identifier: SemVerLevel,
    dependenciesCount: 5,
  },
  {
    name: 'index-of-x',
    identifier: SemVerLevel,
    dependenciesCount: 10,
  },
  {
    name: 'array-includes-x',
    identifier: SemVerLevel,
    dependenciesCount: 9,
  },
  {
    name: 'array-reduce-x',
    identifier: SemVerLevel,
    dependenciesCount: 6,
  },
  {
    name: 'array-union-x',
    identifier: SemVerLevel,
    dependenciesCount: 3,
  },
  {
    name: 'is-prototype-of-x',
    identifier: SemVerLevel,
    dependenciesCount: 3,
  },
  {
    name: 'assert-is-callable-x',
    identifier: SemVerLevel,
    dependenciesCount: 3,
  },
  {
    name: 'array-reduce-right-x',
    identifier: SemVerLevel,
    dependenciesCount: 6,
  },
  {
    name: 'object-define-properties-x',
    identifier: SemVerLevel,
    dependenciesCount: 5,
  },
  {
    name: 'big-counter-x',
    identifier: SemVerLevel,
    dependenciesCount: 4,
  },
  {
    name: 'bind-x',
    identifier: SemVerLevel,
    dependenciesCount: 4,
  },
  {
    name: 'get-function-name-x',
    identifier: SemVerLevel,
    dependenciesCount: 4,
  },
  {
    name: 'get-own-non-enumerable-property-symbols-x',
    identifier: SemVerLevel,
    dependenciesCount: 4,
  },
  {
    name: 'array-some-x',
    identifier: SemVerLevel,
    dependenciesCount: 7,
  },
  {
    name: 'array-difference-x',
    identifier: SemVerLevel,
    dependenciesCount: 5,
  },
  {
    name: 'array-intersection-x',
    identifier: SemVerLevel,
    dependenciesCount: 5,
  },
  {
    name: 'is-set-x',
    identifier: SemVerLevel,
    dependenciesCount: 5,
  },
  {
    name: 'is-map-x',
    identifier: SemVerLevel,
    dependenciesCount: 5,
  },
  {
    name: 'is-array-buffer-x',
    identifier: SemVerLevel,
    dependenciesCount: 5,
  },
  {
    name: 'object-create-x',
    identifier: SemVerLevel,
    dependenciesCount: 6,
  },
  {
    name: 'collections-x',
    identifier: SemVerLevel,
    dependenciesCount: 22,
  },
  {
    name: 'is-async-function-x',
    identifier: SemVerLevel,
    dependenciesCount: 6,
  },
  {
    name: 'is-data-view-x',
    identifier: SemVerLevel,
    dependenciesCount: 6,
  },
  {
    name: 'get-own-property-names-x',
    identifier: SemVerLevel,
    dependenciesCount: 6,
  },
  {
    name: 'object-assign-x',
    identifier: SemVerLevel,
    dependenciesCount: 11,
  },
  {
    name: 'reflect-own-keys-x',
    identifier: SemVerLevel,
    dependenciesCount: 6,
  },
  {
    name: 'string-includes-x',
    identifier: SemVerLevel,
    dependenciesCount: 4,
  },
  {
    name: 'string-starts-with-x',
    identifier: SemVerLevel,
    dependenciesCount: 5,
  },
  {
    name: 'to-iso-string-x',
    identifier: SemVerLevel,
    dependenciesCount: 5,
  },
  {
    name: 'inspect-x',
    identifier: SemVerLevel,
    dependenciesCount: 56,
  },
  {
    name: 'util-format-x',
    identifier: SemVerLevel,
    dependenciesCount: 4,
  },
  {
    name: 'calculate-from-index-right-x',
    identifier: SemVerLevel,
    dependenciesCount: 4,
  },
  {
    name: 'find-last-index-x',
    identifier: SemVerLevel,
    dependenciesCount: 5,
  },
  {
    name: 'get-own-non-enumerable-keys-x',
    identifier: SemVerLevel,
    dependenciesCount: 6,
  },
  {
    name: 'get-function-args-x',
    identifier: SemVerLevel,
    dependenciesCount: 6,
  },
  {
    name: 'define-properties-x',
    identifier: SemVerLevel,
    dependenciesCount: 6,
  },
  {
    name: 'object-walk-x',
    identifier: SemVerLevel,
    dependenciesCount: 7,
  },
  {
    name: 'deep-equal-x',
    identifier: SemVerLevel,
    dependenciesCount: 19,
  },
  {
    name: 'is-deep-strict-equal-x',
    identifier: SemVerLevel,
    dependenciesCount: 30,
  },
  {
    name: 'truncate-x',
    identifier: SemVerLevel,
    dependenciesCount: 8,
  },
  {
    name: 'string-repeat-x',
    identifier: SemVerLevel,
    dependenciesCount: 4,
  },
  {
    name: 'string-ends-with-x',
    identifier: SemVerLevel,
    dependenciesCount: 7,
  },
  {
    name: 'error-x',
    identifier: SemVerLevel,
    dependenciesCount: 23,
  },
  {
    name: 'assert-x',
    identifier: SemVerLevel,
    dependenciesCount: 8,
  },
  {
    name: 'number-format-x',
    identifier: SemVerLevel,
    dependenciesCount: 8,
  },
  {
    name: 'reflect-define-property-x',
    identifier: SemVerLevel,
    dependenciesCount: 9,
  },
  {
    name: 'is-plain-object-x',
    identifier: SemVerLevel,
    dependenciesCount: 9,
  },
  {
    name: 'last-index-of-x',
    identifier: SemVerLevel,
    dependenciesCount: 9,
  },
  {
    name: 'cross-console-x',
    identifier: SemVerLevel,
    dependenciesCount: 19,
  },
  {
    name: 'enumify-x',
    identifier: SemVerLevel,
    dependenciesCount: 6,
  },
  {
    name: '@xotic750/color',
    identifier: SemVerLevel,
    dependencyClashes: ['lodash'],
    dependenciesCount: 3,
  },
  {
    name: '@xotic750/colorable',
    identifier: SemVerLevel,
    dependencyClashes: ['lodash'],
    dependenciesCount: 2,
    devDependencies: ['colors.css'],
  },
  {
    name: 'replace-x',
    identifier: SemVerLevel,
    dependencyClashes: ['lodash'],
    dependenciesCount: 5,
  },
];

/**
 * The files to copy from the template to the repo.
 *
 * @type {Array<string>}
 */
const copyFiles = [
  '.babelrc',
  '.bettercodehub.yml',
  '.editorconfig',
  '.eslintignore',
  '.eslintrc.js',
  '.gitignore',
  '.npmignore',
  '.nvmrc',
  '.prettierignore',
  '.prettierrc.json',
  '.travis.yml',
  'jest.config.js',
  'webpack.config.js',
  '__tests__/.eslintrc.js',
  'src/.eslintrc.js',
];

/**
 * Authenticate against GitHub and get the API.
 *
 * @param {string} username - The login.
 * @param {string} password - The password.
 * @returns {Promise<GitHub>} - The API.
 */
const getGithubAPI = async (username, password) => {
  console.log();
  console.log('GitHub authentication');
  console.log();
  const github = new GitHub({
    username,
    password,
    auth: 'basic',
  });

  await github.getUser().listNotifications({all: true}, (error /* , result, request */) => {
    if (error) {
      throw new Error(error);
    }

    console.log('GitHub authentication OK');
  });

  return github;
};

const asyncForEach = async function asyncForEach(array, callback) {
  return array.reduce(async (promise, item, index) => {
    // This line will wait for the last async function to finish.
    // The first iteration uses an already resolved Promise
    // so, it will immediately continue.
    await promise;

    return callback(array[index], index, array);
  }, Promise.resolve());
};

const getCredentials = function getCredentials() {
  if (fs.existsSync(path.resolve('credentials.json'))) {
    /* eslint-disable-next-line global-require */
    return require('../credentials.json');
  }

  return {
    login: readlineSync.question('Login: '),
    password: readlineSync.question('Password: '),
  };
};

/**
 * Let's GO!
 *
 * @returns {Promise<boolean>} - Async.
 */
const letsGo = async () => {
  const CREDENTIALS = getCredentials();

  /**
   * GitHub login.
   *
   * @type {string}
   * */
  const GITHUB_LOGIN = CREDENTIALS.login;

  /**
   * GitHub password.
   *
   * @type {string}
   * */
  const GITHUB_PASSWORD = CREDENTIALS.password;

  /**
   *  Test GitHub authentication and get API.
   *
   * @type {GitHub}
   */
  const GITHUB_API = await getGithubAPI(GITHUB_LOGIN, GITHUB_PASSWORD);
  // console.log(GITHUB_API);

  /**
   * Text used for title of commit and for GitHub releases.
   * Default is to bookmark the version.
   *
   * @type {string}
   * */
  const TITLE_TEXT = CHECK_PROJECTS_ONLY ? '' : readlineSync.question('Title (:bookmark: vX.X.X)? ');

  /**
   * Text used for body of commit and for GitHub releases.
   *
   * @type {string}
   * */
  const BODY_TEXT = CHECK_PROJECTS_ONLY ? '' : readlineSync.question('Body ()? ');

  /**
   * Remove local copy when completed.
   *
   * @type {boolean}
   * */
  const REMOVE_LOCAL_COPY = CHECK_PROJECTS_ONLY
    ? false
    : readlineSync.question('Remove local [yes](no)? ').toLocaleString() === 'yes';

  /**
   * Do not publish.
   *
   * @type {boolean}
   * */
  const PUBLISH = readlineSync.question('Publish [yes](no)? ').toLocaleString() === 'yes';

  if (PUBLISH) {
    console.log();
    console.log('Publish');
    console.log();
  }

  let pleaseContinue = Boolean(CONTINUE_FROM);
  let isContinueFrom = false;
  const projectUpdate = async (project, index) => {
    const {name: repoName, identifier, regenerator, dependencyClashes, deprecated, devDependencies} = project;
    const name = repoName.replace('@xotic750/', '');
    const repoDir = `${TMP}/${name}`;

    if (pleaseContinue && !isContinueFrom) {
      if (CONTINUE_FROM === name) {
        isContinueFrom = true;
        pleaseContinue = false;
      } else {
        console.log();
        console.log(`Will continue: ${name} skipping`);
        console.log();
      }

      return;
    }

    const repoURL = `${GITHUB_URL_PREFIX}/${name}.git`;
    console.log();
    console.log('------------------------------------------------------------');
    console.log(`Name: ${name}`);
    console.log('------------------------------------------------------------');
    console.log();

    if (deprecated) {
      console.log();
      console.log(`Deprecated: ${name} skipping`);
      console.log();

      return;
    }

    if (!fs.existsSync(path.resolve(repoDir))) {
      /* Clone the GitHub repo. */
      console.log();
      console.log(`Cloning: ${repoURL}`);
      console.log();
      const cloneResult = shelljs.exec(`git clone ${repoURL} ${repoDir}`);

      if (cloneResult.code !== 0) {
        throw new Error(cloneResult.stderr);
      }
    } else {
      /* Pull the GitHub repo. */
      console.log();
      console.log(`Pulling: ${repoURL}`);
      console.log();
      const pullResult = shelljs.exec(`cd ${repoDir} && git pull`);

      if (pullResult.code !== 0) {
        throw new Error(pullResult.stderr);
      }
    }

    /* Check the integrity and order of projects. */
    console.log();
    console.log('Check the integrity and order of projects');
    console.log();
    const projectNames = projects.map((proj) => {
      return proj.name;
    });

    const uniqueNames = new Set(projectNames);

    if (uniqueNames.size !== projects.length) {
      const duplicates = projectNames.reduce((dupes, projectName, idx) => {
        if (projectNames.indexOf(projectName) !== idx && !dupes.includes(projectName)) {
          dupes.push(projectName);
        }

        return dupes;
      }, []);

      console.log(duplicates);

      throw new Error('projects has duplicates');
    }

    /* eslint-disable-next-line global-require,import/no-dynamic-require */
    const repoPackage = require(`../${repoDir}/package.json`);
    const toComes = projects.slice(index);
    const dependencyKeys = Object.keys(repoPackage.dependencies);

    dependencyKeys.forEach((dependencyName) => {
      if (dependencyName.endsWith('-x')) {
        const isInProjects = projects.find((proj) => {
          return dependencyName === proj.name;
        });

        if (!isInProjects) {
          throw new Error(`${dependencyName} is missing from projects`);
        }

        const toCome = toComes.find((proj) => {
          return dependencyName === proj.name;
        });

        if (toCome) {
          throw new Error(`${name} requires ${toCome.name}`);
        }
      }
    });

    if (!CHECK_PROJECTS_ONLY) {
      /* Copy the listed files from the template to the repo. */
      console.log();
      console.log('Copying ...');
      console.log();
      copyFiles.forEach((file) => {
        /* Requires babel regenerator runtime transform. */
        if (regenerator && file === '.babelrc') {
          const regeneratorFile = `${file}.regenerator`;
          console.log(`File: ${regeneratorFile}`);
          const copyResult = shelljs.cp(`template/${regeneratorFile}`, `${repoDir}/${file}`);

          if (copyResult.code !== 0) {
            throw new Error(copyResult.stderr);
          }
        } else {
          if (name === 'replace-x') {
            const skipThese = ['.babelrc', 'jest.config.js', 'webpack.config.js'];

            if (skipThese.includes(file)) {
              console.log(`Skipping file: ${file}`);

              return;
            }
          }

          console.log(`File: ${file}`);
          const destination = `${repoDir}/${file}`;
          let runAdd = false;

          if (!fs.existsSync(path.resolve(destination))) {
            runAdd = true;
          }

          const copyResult = shelljs.cp(`template/${file}`, destination);

          if (copyResult.code !== 0) {
            throw new Error(copyResult.stderr);
          }

          if (runAdd) {
            /* Add the new file to git */
            console.log();
            console.log(`Running git add ${file}`);
            console.log();
            const addCopyFileResult = shelljs.exec(`cd ${repoDir} && git add ${file}`);

            if (addCopyFileResult.code !== 0) {
              throw new Error(addCopyFileResult.stderr);
            }
          }

          const srcFile = `${repoDir}/__tests__/${name}.test.js`;
          const projectSource = fs.readFileSync(path.resolve(srcFile), 'utf8');

          const removeComments = [
            '/* eslint-disable-next-line compat/compat */',
            '/* eslint-disable-next-line lodash/prefer-noop */',
            '/* eslint-disable-next-line compat/compat */',
            '/* eslint-disable-next-line prefer-rest-params */',
            '/* eslint-disable-next-line jest/no-hooks */',
            '/* eslint-disable-next-line no-void */',
            '/* eslint-disable-next-line compat/compat,no-void */',
            '/* eslint-disable-next-line no-void,compat/compat */',
            '/* eslint-disable-next-line no-void,lodash/prefer-noop */',
            '/* eslint-disable-next-line no-prototype-builtins */',
            '// eslint-disable-next-line no-new-func',
            '// eslint-disable-next-line no-prototype-builtins',
          ];

          let testSrc = projectSource;

          removeComments.forEach((removeComment) => {
            let hasComment = testSrc.includes(removeComment);

            if (hasComment) {
              console.log('Removing: ', removeComment);
            }

            while (hasComment) {
              testSrc = testSrc.replace(removeComment, '');
              console.log('Removed');
              hasComment = testSrc.includes(removeComment);
            }
          });

          if (testSrc !== projectSource) {
            fs.writeFileSync(path.resolve(srcFile), testSrc);
            console.log('Replaced');
          }
        }
      });

      /* Get repo package.json and update the information. */
      console.log();
      console.log('Updating package.json');
      console.log();
      const modifiedRepoPackage = packageKeyOrder.reduce((obj, key) => {
        if (name === 'replace-x') {
          if (key === 'scripts' || key === 'browserslist' || key === 'files') {
            obj[key] = cloneDeep(repoPackage[key]);

            return obj;
          }
        }

        const templateValue = templatePackage[key];

        obj[key] = cloneDeep(typeof templateValue === 'undefined' ? repoPackage[key] : templateValue);

        return obj;
      }, {});

      const newRepoPackage = packageKeyOrder.reduce((obj, key) => {
        obj[key] = cloneDeep(modifiedRepoPackage[key]);

        return obj;
      }, {});

      /* Update the repo dependencies */
      console.log();
      console.log('Updating dependencies');
      console.log();
      const salitaResult = shelljs.exec(`cd ${repoDir} && salita --ignore-pegged --only-changed --json`);

      if (salitaResult.code !== 0) {
        throw new Error(salitaResult.stderr);
      }

      const salitaJSON = JSON.parse(salitaResult.stdout);
      salitaJSON.dependencies.forEach((dependency) => {
        if (dependency.isUpdateable) {
          newRepoPackage.dependencies[dependency.name] = dependency.after;
        }
      });

      /* Remove any dependency/devDependency clashes */
      if (dependencyClashes) {
        console.log(`Removing clashes from ${name}`);
        dependencyClashes.forEach((dependencyClash) => {
          console.log(`Clash: ${dependencyClash}`);
          delete newRepoPackage.devDependencies[dependencyClash];
        });
      }

      if (devDependencies) {
        /* Run npm install on the repo. */
        console.log();
        console.log('Running devDependencies');
        console.log();
        devDependencies.forEach((devDependency) => {
          console.log(devDependency);
          const npmDevInstallResult = shelljs.exec(`npm view ${devDependency} version`);

          if (npmDevInstallResult.code !== 0) {
            throw new Error(npmDevInstallResult.stderr);
          }

          newRepoPackage.devDependencies[devDependency] = `^${npmDevInstallResult.stdout.trim()}`;
        });

        newRepoPackage.devDependencies = Object.keys(newRepoPackage.devDependencies)
          .sort()
          .reduce((deps, key) => {
            deps[key] = newRepoPackage.devDependencies[key];

            return deps;
          }, {});
      }

      /* Write the new repo package.json file. */
      console.log();
      console.log(`Writing ${name} package.json`);
      console.log();
      const repoJSON = `${JSON.stringify(newRepoPackage, null, 2).replace(/{PACKAGE_NAME}/gm, name)}\n`;
      fs.writeFileSync(`${repoDir}/package.json`, repoJSON);

      if (UPDATE_README) {
        /* Update README.md */
        console.log();
        console.log(`Updating README.md: ${name}`);
        console.log();
        const readmeFile = `${repoDir}/README.md`;
        const readme = fs.readFileSync(path.resolve(readmeFile), 'utf8');
        const escapedRepoName = repoName.replace('@', '%40').replace('/', '%2');
        const badges =
          '<a\n' +
          `  href="https://travis-ci.org/Xotic750/${name}"\n` +
          '  title="Travis status">\n' +
          '<img\n' +
          `  src="https://travis-ci.org/Xotic750/${name}.svg?branch=master"\n` +
          '  alt="Travis status" height="18">\n' +
          '</a>\n' +
          '<a\n' +
          `  href="https://david-dm.org/Xotic750/${name}"\n` +
          '  title="Dependency status">\n' +
          `<img src="https://david-dm.org/Xotic750/${name}/status.svg"\n` +
          '  alt="Dependency status" height="18"/>\n' +
          '</a>\n' +
          '<a\n' +
          `  href="https://david-dm.org/Xotic750/${name}?type=dev"\n` +
          '  title="devDependency status">\n' +
          `<img src="https://david-dm.org/Xotic750/${name}/dev-status.svg"\n` +
          '  alt="devDependency status" height="18"/>\n' +
          '</a>\n' +
          '<a\n' +
          `  href="https://badge.fury.io/js/${escapedRepoName}"\n` +
          '  title="npm version">\n' +
          `<img src="https://badge.fury.io/js/${escapedRepoName}.svg"\n` +
          '  alt="npm version" height="18">\n' +
          '</a>\n' +
          '<a\n' +
          `  href="https://www.jsdelivr.com/package/npm/${name}"\n` +
          '  title="jsDelivr hits">\n' +
          `<img src="https://data.jsdelivr.com/v1/package/npm/${name}/badge?style=rounded"\n` +
          '  alt="jsDelivr hits" height="18">\n' +
          '</a>\n' +
          '<a\n' +
          `  href="https://bettercodehub.com/results/Xotic750/${name}"\n` +
          '  title="bettercodehub score">\n' +
          `<img src="https://bettercodehub.com/edge/badge/Xotic750/${name}?branch=master"\n` +
          '  alt="bettercodehub score" height="18">\n' +
          '</a>\n\n';

        const rxBadges = /<a[\s\S]+href="https:\/\/travis[\s\S]+alt="jsDelivr hits" height="18">\n<\/a>[\n]+/gm;
        const matchBadges = readme.match(rxBadges);

        if (matchBadges && !matchBadges[0].includes('bettercodehub')) {
          const newReadme = readme.replace(rxBadges, badges);
          fs.writeFileSync(path.resolve(readmeFile), newReadme);

          console.log();
          console.log(`Updated README.md: ${name}`);
          console.log();
        }
      }

      const describeResult = shelljs.exec(`cd ${repoDir} && git describe --dirty --always`);

      if (describeResult.code !== 0) {
        throw new Error(describeResult.stderr);
      }

      const isDirty = describeResult.stdout.includes('-dirty');

      if (!isDirty) {
        console.log();
        console.log(`No change, skipping: ${name}`);
        console.log();
      }

      if (isDirty) {
        if (PUBLISH) {
          const semver = new SemVer(newRepoPackage.version).inc(identifier);
          newRepoPackage.version = semver.toString();
          console.log();
          console.log(`Update ${name} version using ${identifier} from ${repoPackage.version} to ${newRepoPackage.version}`);
          console.log();
        }

        /* Write the new repo package.json file. */
        console.log();
        console.log(`Writing ${name} package.json`);
        console.log();
        const repoSemverJSON = `${JSON.stringify(newRepoPackage, null, 2).replace(/{PACKAGE_NAME}/gm, name)}\n`;
        fs.writeFileSync(`${repoDir}/package.json`, repoSemverJSON);

        /* Run npm install on the repo. */
        console.log();
        console.log('Running npm install');
        console.log();
        const npmInstallResult = shelljs.exec(`cd ${repoDir} && npm install`);

        if (npmInstallResult.code !== 0) {
          throw new Error(npmInstallResult.stderr);
        }

        /* Run npm security-fix  */
        console.log();
        console.log('Running npm run security-fix');
        console.log();
        const npmSecurityResult = shelljs.exec(`cd ${repoDir} && npm run security-fix`);

        if (npmSecurityResult.code !== 0 && npmSecurityResult.code !== 1) {
          throw new Error(npmSecurityResult.stderr);
        }

        /* Run the repo lint-fic script. */
        console.log();
        console.log('Running npm run lint-fix');
        console.log();
        const lintFixResult = shelljs.exec(`cd ${repoDir} && npm run lint-fix`);

        if (lintFixResult.code !== 0) {
          throw new Error(lintFixResult.stderr);
        }

        /* Run the repo build script. */
        console.log();
        console.log('Running npm run build');
        console.log();
        const buildResult = shelljs.exec(`cd ${repoDir} && npm run build`);

        if (buildResult.code !== 0) {
          throw new Error(buildResult.stderr);
        }

        /* Run the repo test script. */
        console.log();
        console.log('Running npm run test');
        console.log();
        const testResult = shelljs.exec(`cd ${repoDir} && npm run test`);

        if (testResult.code !== 0) {
          throw new Error(testResult.stderr);
        }

        /* Add the git changes */
        console.log();
        console.log('Running git add -A');
        console.log();
        const addResult = shelljs.exec(`cd ${repoDir} && git add -A`);

        if (addResult.code !== 0) {
          throw new Error(addResult.stderr);
        }

        /* Add the package-lock.json */
        console.log();
        console.log('Running git add package-lock.json');
        console.log();
        const addLockResult = shelljs.exec(`cd ${repoDir} && git add --force package-lock.json`);

        if (addLockResult.code !== 0) {
          throw new Error(addLockResult.stderr);
        }

        /* Commit the git changes. */
        console.log();
        console.log('Running git commit');
        console.log();
        const commitBody = BODY_TEXT ? ` -m "${BODY_TEXT}"` : '';
        const commitTitle = TITLE_TEXT || `:bookmark: v${newRepoPackage.version}`;
        const commitCmd = `git commit -m "${commitTitle}"${commitBody}`;
        const commitResult = shelljs.exec(`cd ${repoDir} && ${commitCmd}`);

        if (commitResult.code !== 0 && !commitResult.stdout.includes('nothing to commit')) {
          throw new Error(commitResult.stderr);
        }

        /* Push the commit to GitHub. */
        console.log();
        console.log('Running git push');
        console.log();
        const pushResult = shelljs.exec(`cd ${repoDir} && git push`);

        if (pushResult.code !== 0) {
          throw new Error(pushResult.stderr);
        }

        if (PUBLISH) {
          /* Publish NPM. */
          console.log();
          console.log('Running npm publish');
          console.log();
          const publishResult = shelljs.exec(`cd ${repoDir} && npm publish`);

          if (publishResult.code !== 0) {
            throw new Error(publishResult.stderr);
          }
        }

        if (PUBLISH) {
          /* Publish GitHub release. */
          console.log();
          console.log('GitHub release');
          console.log();
          const remoteRepo = await GITHUB_API.getRepo(GITHUB_REPO_PREFIX, name);
          console.log(remoteRepo);

          console.log();
          console.log('Generating release name');
          console.log();
          const releaseName = new Haikunator().haikunate();
          console.log(releaseName);

          console.log('Creating GitHub release');
          await remoteRepo.createRelease(
            {
              tag_name: `v${newRepoPackage.version}`,
              name: releaseName,
              body: BODY_TEXT,
            },
            (error /* , result, request */) => {
              if (error) {
                throw new Error(error);
              }

              console.log('GitHub release created');
            },
          );
        }
      }
    }

    /* Remove local repo copy. */
    if (REMOVE_LOCAL_COPY) {
      console.log();
      console.log(`Running rm -rf ${repoDir}`);
      console.log();
      const rmTmpResult = shelljs.rm('-rf', repoDir);

      if (rmTmpResult.code !== 0) {
        throw new Error(rmTmpResult.stderr);
      }
    }

    fs.writeFileSync('last.json', `${JSON.stringify({name}, null, 2)}\n`);

    console.log();
    console.log('Waiting 5 seconds before continuing');
    console.log();
    /* eslint-disable-next-line no-use-extend-native/no-use-extend-native */
    await Promise.delay(5000);
  };

  await asyncForEach(projects, projectUpdate);

  /* Remove TMP */
  if (REMOVE_LOCAL_COPY) {
    console.log();
    console.log(`Running rm -rf ${TMP}`);
    console.log();
    const rmTmpResult = shelljs.rm('-rf', TMP);

    if (rmTmpResult.code !== 0) {
      throw new Error(rmTmpResult.stderr);
    }
  }

  /* Remove last.json */
  if (fs.existsSync(path.resolve('last.json'))) {
    console.log();
    console.log('Running rm last.json');
    console.log();
    const rmTmpResult = shelljs.rm('last.json');

    if (rmTmpResult.code !== 0) {
      throw new Error(rmTmpResult.stderr);
    }
  }

  /* We finished! */
  console.log();
  console.log('Done.');
  console.log();

  return true;
};

letsGo();
