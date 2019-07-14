const readlineSync = require('readline-sync');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const SemVer = require('semver');
const GitHub = require('github-api');
const Haikunator = require('haikunator');
const cloneDeep = require('lodash/cloneDeep');
const templatePackage = require('../template/package.json');

const SemVerLevel = 'patch';
const CONTINUE_FROM = fs.existsSync(path.resolve('last.json')) ? require('../last.json').name : '';

if (CONTINUE_FROM) {
  console.log(`Continuing from: ${CONTINUE_FROM}`);
}

const TERRAFORM = true;

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
 * Generate a release name for GitHub releases.
 *
 * @type {boolean}
 * */
const GENERATE_RELEASE_NAME = true;

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
  /* Ready projects */
  {
    name: 'delay-promise-x',
    identifier: SemVerLevel,
    regenerator: true,
    dependencyClashes: ['lodash'],
  },
  {
    name: 'to-string-x',
    identifier: SemVerLevel,
  },
  {
    name: 'is-nan-x',
    identifier: SemVerLevel,
  },
  {
    name: 'same-value-x',
    identifier: SemVerLevel,
  },
  {
    name: 'same-value-zero-x',
    identifier: SemVerLevel,
  },
  {
    name: 'is-nil-x',
    identifier: SemVerLevel,
  },
  {
    name: 'infinity-x',
    identifier: SemVerLevel,
  },
  {
    name: 'is-finite-x',
    identifier: SemVerLevel,
  },
  {
    name: 'nan-x',
    identifier: SemVerLevel,
  },
  {
    name: 'to-boolean-x',
    identifier: SemVerLevel,
  },
  {
    name: 'is-truthy-x',
    identifier: SemVerLevel,
  },
  {
    name: 'is-falsey-x',
    identifier: SemVerLevel,
  },
  {
    name: 'attempt-x',
    identifier: SemVerLevel,
  },
  {
    name: 'cached-constructors-x',
    identifier: SemVerLevel,
  },
  {
    name: 'has-symbol-support-x',
    identifier: SemVerLevel,
  },
  {
    name: 'to-string-tag-x',
    identifier: SemVerLevel,
  },
  {
    name: 'has-boxed-string-x',
    identifier: SemVerLevel,
  },
  {
    name: 'to-string-symbols-supported-x',
    identifier: SemVerLevel,
  },
  {
    name: 'split-if-boxed-bug-x',
    identifier: SemVerLevel,
  },
  {
    name: 'is-array-x',
    identifier: SemVerLevel,
  },
  {
    name: 'require-object-coercible-x',
    identifier: SemVerLevel,
  },
  {
    name: 'require-coercible-to-string-x',
    identifier: SemVerLevel,
  },
  {
    name: 'regexp-escape-x',
    identifier: SemVerLevel,
  },
  {
    name: 'has-to-string-tag-x',
    identifier: SemVerLevel,
  },
  {
    name: 'white-space-x',
    identifier: SemVerLevel,
  },
  {
    name: 'trim-left-x',
    identifier: SemVerLevel,
  },
  {
    name: 'trim-right-x',
    identifier: SemVerLevel,
  },
  {
    name: 'trim-x',
    identifier: SemVerLevel,
  },
  {
    name: 'replace-comments-x',
    identifier: SemVerLevel,
  },
  {
    name: 'normalize-space-x',
    identifier: SemVerLevel,
  },
  {
    name: 'is-function-x',
    identifier: SemVerLevel,
  },
  {
    name: 'is-object-like-x',
    identifier: SemVerLevel,
  },
  {
    name: 'parse-int-x',
    identifier: SemVerLevel,
  },
  {
    name: 'to-primitive-x',
    identifier: SemVerLevel,
  },
  {
    name: 'to-number-x',
    identifier: SemVerLevel,
  },
  {
    name: 'is-node-x',
    identifier: SemVerLevel,
  },
  {
    name: 'modulo-x',
    identifier: SemVerLevel,
  },
  {
    name: 'is-surrogate-pair-x',
    identifier: SemVerLevel,
  },

  /* Terraform projects */
  {
    name: 'number-to-decimal-form-string-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'assert-is-function-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'math-sign-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'to-integer-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'to-length-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'to-object-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'array-filter-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'array-every-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'array-map-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'array-for-each-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'array-some-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'array-reduce-right-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'array-reduce-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'array-like-slice-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'array-slice-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'to-property-key-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'has-own-property-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'assert-is-object-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'object-define-property-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'math-clamp-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'is-index-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'property-is-enumerable-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'object-get-own-property-descriptor-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'is-regexp-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'truncate-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'is-integer-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'is-safe-integer-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'is-length-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'is-array-like-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'calculate-from-index-right-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'calculate-from-index-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'number-format-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'to-uint-24-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'string-pad-start-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'int-to-rgb-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'get-prototype-of-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'is-async-function-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'get-function-name-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'is-prototype-of-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'assert-is-callable-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'string-quote-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'create-array-fix-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'is-map-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'is-set-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'string-includes-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'string-starts-with-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'to-iso-string-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'get-own-property-symbols-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'get-own-enumerable-property-symbols-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'object-keys-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'get-own-property-names-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'object-assign-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'find-index-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'find-last-index-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'last-index-of-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'index-of-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'array-includes-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'has-reflect-support-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'reflect-define-property-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'get-own-enumerable-keys-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'object-define-properties-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'object-create-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'big-counter-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'is-array-buffer-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'is-data-view-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'object-walk-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'define-properties-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'reflect-own-keys-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'get-own-non-enumerable-keys-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'bind-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'power-set-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'is-error-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'get-function-args-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'shuffle-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'get-own-non-enumerable-property-symbols-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'array-union-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'array-difference-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'array-intersection-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'collections-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'inspect-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'deep-equal-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'safe-to-string-x',
    identifier: SemVerLevel,
    terraform: true,
    deprecated: true,
  },
  {
    name: 'error-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'assert-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'util-format-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'cross-console-x',
    identifier: SemVerLevel,
    terraform: true,
  },
  {
    name: 'is-plain-object-x',
    identifier: SemVerLevel,
    terraform: true,
  },
];

/**
 * The files to copy from the template to the repo.
 *
 * @type {Array<string>}
 */
const copyFiles = [
  '.babelrc',
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
    : readlineSync.question('Remove local (yes)[no]? ').toLocaleString() !== 'no';

  /**
   * Do not push or publish.
   *
   * @type {boolean}
   * */
  const DRY_RUN = CHECK_PROJECTS_ONLY ? true : readlineSync.question('Dry run (yes)[no]? ').toLocaleString() !== 'no';

  if (DRY_RUN) {
    console.log();
    console.log('Dry run');
    console.log();
  }

  let pleaseContinue = Boolean(CONTINUE_FROM);
  let isContinueFrom = false;
  const projectUpdate = async (project, index) => {
    let isTerraformed = false;
    const {name, identifier, regenerator, dependencyClashes, terraform, deprecated} = project;
    const repoDir = `${TMP}/${name}`;

    if (pleaseContinue && !isContinueFrom) {
      if (CONTINUE_FROM === name) {
        isContinueFrom = true;
        pleaseContinue = false;
        console.log();
        console.log(`Running rm -rf ${repoDir}`);
        console.log();
        const rmTmpResult = shell.rm('-rf', repoDir);

        if (rmTmpResult.code !== 0) {
          throw new Error(rmTmpResult.stderr);
        }
      } else {
        console.log();
        console.log(`Will continue: ${name} skipping`);
        console.log();

        return;
      }
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
    }

    if (!fs.existsSync(path.resolve(repoDir))) {
      /* Clone the GitHub repo. */
      console.log();
      console.log(`Cloning: ${repoURL}`);
      console.log();
      const cloneResult = shell.exec(`git clone ${repoURL} ${repoDir}`);

      if (cloneResult.code !== 0) {
        throw new Error(cloneResult.stderr);
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
    Object.keys(repoPackage.dependencies).forEach((dependencyName) => {
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
      /* Perform terraforming of old projects */
      if (TERRAFORM && terraform) {
        const libDir = `${repoDir}/lib`;
        const testsDir = `${repoDir}/tests`;

        if (fs.existsSync(path.resolve(libDir)) && fs.existsSync(path.resolve(testsDir))) {
          console.log();
          console.log('Terraforming');
          console.log();

          const testsNewDir = `${repoDir}/__tests__`;
          console.log();
          console.log(`Make dir: ${testsNewDir}`);
          console.log();
          const mdTestsDirResult = shell.mkdir(testsNewDir);

          if (mdTestsDirResult.code !== 0) {
            throw new Error(mdTestsDirResult.stderr);
          }

          const testFile = `${testsDir}/spec/test.js`;
          console.log();
          console.log(`Copy: ${testFile}`);
          console.log();
          const cpTestFileResult = shell.cp(testFile, `${testsNewDir}/${name}.test.js`);

          if (cpTestFileResult.code !== 0) {
            throw new Error(cpTestFileResult.stderr);
          }

          const srcDir = `${repoDir}/src`;
          console.log();
          console.log(`Make dir: ${srcDir}`);
          console.log();
          const mdSrcDirResult = shell.mkdir(srcDir);

          if (mdSrcDirResult.code !== 0) {
            throw new Error(mdSrcDirResult.stderr);
          }

          const indexFile = `${repoDir}/index.js`;
          console.log();
          console.log(`Copy: ${indexFile}`);
          console.log();
          const cpIndexFileResult = shell.cp(indexFile, `${srcDir}/${name}.js`);

          if (cpIndexFileResult.code !== 0) {
            throw new Error(cpIndexFileResult.stderr);
          }

          const terraformRemoves = [
            'lib',
            'tests',
            '.editorconfig',
            '.eslintignore',
            '.eslintrc.json',
            '.gitignore',
            '.npmignore',
            '.nvmrc',
            '.travis.yml',
            '.uglifyjsrc.json',
            'badges.html',
            'index.js',
            'package-lock.json',
          ];

          terraformRemoves.forEach((removeName) => {
            const removePath = `${repoDir}/${removeName}`;
            console.log();
            console.log(`Running rm -rf ${removePath}`);
            console.log();
            const rmPathResult = shell.rm('-rf', removePath);

            if (rmPathResult.code !== 0) {
              throw new Error(rmPathResult.stderr);
            }
          });
        }

        /* Remove missed files for terraformed */
        const uglifyConfig = `${repoDir}/.uglifyjsrc.json`;

        if (fs.existsSync(path.resolve(uglifyConfig))) {
          console.log();
          console.log(`Running rm -rf ${uglifyConfig}`);
          console.log();
          const rmUglifyResult = shell.rm('-rf', uglifyConfig);

          if (rmUglifyResult.code !== 0) {
            throw new Error(rmUglifyResult.stderr);
          }
        }

        isTerraformed = true;
      }

      /* Copy the listed files from the template to the repo. */
      console.log();
      console.log('Copying ...');
      console.log();
      copyFiles.forEach((file) => {
        /* Requires babel regenerator runtime transform. */
        if (regenerator && file === '.babelrc') {
          const regeneratorFile = `${file}.regenerator`;
          console.log(`File: ${regeneratorFile}`);
          const copyResult = shell.cp(`template/${regeneratorFile}`, `${repoDir}/${file}`);

          if (copyResult.code !== 0) {
            throw new Error(copyResult.stderr);
          }
        } else {
          console.log(`File: ${file}`);
          const copyResult = shell.cp(`template/${file}`, `${repoDir}/${file}`);

          if (copyResult.code !== 0) {
            throw new Error(copyResult.stderr);
          }
        }
      });

      /* Get repo package.json and update the information. */
      console.log();
      console.log('Updating package.json');
      console.log();
      const modifiedRepoPackage = packageKeyOrder.reduce((obj, key) => {
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
      const salitaResult = shell.exec(`cd ${repoDir} && salita --ignore-pegged --only-changed --json`);

      if (salitaResult.code !== 0) {
        throw new Error(salitaResult.stderr);
      }

      const salitaJSON = JSON.parse(salitaResult.stdout);
      salitaJSON.dependencies.forEach((dependency) => {
        if (dependency.isUpdateable) {
          newRepoPackage.dependencies[dependency.name] = dependency.after;
        }

        if (TERRAFORM && dependency.name === 'safe-to-string-x') {
          if (terraform) {
            delete newRepoPackage.dependencies[dependency.name];

            newRepoPackage.dependencies['to-string-symbols-supported-x'] = '^2.0.2';
          } else {
            throw new Error(`${name} has deprecated safe-to-string-x`);
          }
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

      /* Write the new repo package.json file. */
      console.log();
      console.log(`Writing ${name} package.json`);
      console.log();
      const repoJSON = `${JSON.stringify(newRepoPackage, null, 2).replace(/{PACKAGE_NAME}/gm, name)}\n`;
      fs.writeFileSync(`${repoDir}/package.json`, repoJSON);

      /* Replace deprecated package name in source file */
      if (TERRAFORM && terraform && Object.keys(newRepoPackage.dependencies).includes('to-string-symbols-supported-x')) {
        console.log();
        console.log(`Replacing deprecated safe-to-string-x ${name} source file`);
        console.log();
        const srcFile = `${repoDir}/src/${name}.js`;
        const projectSource = fs.readFileSync(path.resolve(srcFile), 'utf8');

        if (projectSource.includes('safe-to-string-x')) {
          const src = projectSource.replace('safe-to-string-x', 'to-string-symbols-supported-x');
          fs.writeFileSync(path.resolve(srcFile), src);
        }
      }

      const describeResult = shell.exec(`cd ${repoDir} && git describe --dirty --always`);

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
        if (!isTerraformed) {
          const semver = new SemVer(newRepoPackage.version).inc(identifier);
          newRepoPackage.version = semver.toString();
          console.log();
          console.log(`Update ${name} version using ${identifier} from ${repoPackage.version} to ${newRepoPackage.version}`);
          console.log();

          /* Write the new repo package.json file. */
          console.log();
          console.log(`Writing ${name} package.json`);
          console.log();
          const repoSemverJSON = `${JSON.stringify(newRepoPackage, null, 2).replace(/{PACKAGE_NAME}/gm, name)}\n`;
          fs.writeFileSync(`${repoDir}/package.json`, repoSemverJSON);
        }

        /* Run npm install on the repo. */
        console.log();
        console.log('Running npm install');
        console.log();
        const npmInstallResult = shell.exec(`cd ${repoDir} && npm install`);

        if (npmInstallResult.code !== 0) {
          throw new Error(npmInstallResult.stderr);
        }

        /* Run the repo lint-fic script. */
        console.log();
        console.log('Running npm run lint-fix');
        console.log();
        const lintFixResult = shell.exec(`cd ${repoDir} && npm run lint-fix`);

        if ((!terraform && lintFixResult.code !== 0) || (terraform && lintFixResult.code > 1)) {
          throw new Error(lintFixResult.stderr);
        }

        if (!terraform) {
          /* Run the repo build script. */
          console.log();
          console.log('Running npm run build');
          console.log();
          const buildResult = shell.exec(`cd ${repoDir} && npm run build`);

          if (buildResult.code !== 0) {
            throw new Error(buildResult.stderr);
          }

          /* Run the repo test script. */
          console.log();
          console.log('Running npm run test');
          console.log();
          const testResult = shell.exec(`cd ${repoDir} && npm run test`);

          if (testResult.code !== 0) {
            throw new Error(testResult.stderr);
          }
        }

        /* Add the git changes */
        console.log();
        console.log('Running git add -A');
        console.log();
        const addResult = shell.exec(`cd ${repoDir} && git add -A`);

        if (addResult.code !== 0) {
          throw new Error(addResult.stderr);
        }

        /* Add the package-lock.json */
        console.log();
        console.log('Running git add package-lock.json');
        console.log();
        const addLockResult = shell.exec(`cd ${repoDir} && git add --force package-lock.json`);

        if (addLockResult.code !== 0) {
          throw new Error(addLockResult.stderr);
        }

        /* Commit the git changes. */
        console.log();
        console.log('Running git commit');
        console.log();
        const commitBody = BODY_TEXT ? ` -m "${BODY_TEXT}"` : '';
        const commitTitle = isTerraformed ? 'Terraformed' : TITLE_TEXT || `:bookmark: v${newRepoPackage.version}`;
        const commitCmd = `git commit -m "${commitTitle}"${commitBody}`;
        const commitResult = shell.exec(`cd ${repoDir} && ${commitCmd}`);

        if (commitResult.code !== 0 && !commitResult.stdout.includes('nothing to commit')) {
          throw new Error(commitResult.stderr);
        }

        /* Show the git diff. */
        // const diffResult = shell.exec(`cd ${repoDir} && git diff`);
        //
        // if (diffResult.code !== 0) {
        //   throw new Error(diffResult.stderr);
        // }

        if (!DRY_RUN) {
          /* Push the commit to GitHub. */
          console.log();
          console.log('Running git push');
          console.log();
          const pushResult = shell.exec(`cd ${repoDir} && git push`);

          if (pushResult.code !== 0) {
            throw new Error(pushResult.stderr);
          }

          if (!isTerraformed) {
            /* Publish NPM. */
            console.log();
            console.log('Running npm publish');
            console.log();
            const publishResult = shell.exec(`cd ${repoDir} && npm publish`);

            if (publishResult.code !== 0) {
              throw new Error(publishResult.stderr);
            }
          }
        }

        if (!isTerraformed) {
          /* Publish GitHub release. */
          console.log();
          console.log('GitHub release');
          console.log();
          const remoteRepo = await GITHUB_API.getRepo(GITHUB_REPO_PREFIX, name);
          console.log(remoteRepo);

          if (GENERATE_RELEASE_NAME) {
            console.log();
            console.log('Generating release name');
            console.log();
          }

          const releaseName = GENERATE_RELEASE_NAME ? new Haikunator().haikunate() : '';

          if (GENERATE_RELEASE_NAME) {
            console.log(releaseName);
          }

          if (!DRY_RUN) {
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
    }

    /* Remove local repo copy. */
    if (REMOVE_LOCAL_COPY) {
      console.log();
      console.log(`Running rm -rf ${repoDir}`);
      console.log();
      const rmTmpResult = shell.rm('-rf', repoDir);

      if (rmTmpResult.code !== 0) {
        throw new Error(rmTmpResult.stderr);
      }
    }

    fs.writeFileSync('last.json', JSON.stringify({name}, null, 2));
  };

  await asyncForEach(projects, projectUpdate);

  /* Remove TMP */
  if (REMOVE_LOCAL_COPY) {
    console.log();
    console.log(`Running rm -rf ${TMP}`);
    console.log();
    const rmTmpResult = shell.rm('-rf', TMP);

    if (rmTmpResult.code !== 0) {
      throw new Error(rmTmpResult.stderr);
    }
  }

  /* Remove last.json */
  if (fs.existsSync(path.resolve('last.json'))) {
    console.log();
    console.log('Running rm last.json');
    console.log();
    const rmTmpResult = shell.rm('last.json');

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
