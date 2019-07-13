const readlineSync = require('readline-sync');
const fs = require('fs');
const shell = require('shelljs');
const SemVer = require('semver');
const GitHub = require('github-api');
const Haikunator = require('haikunator');
const templatePackage = require('../template/package.json');

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
  {
    name: 'delay-promise-x',
    identifier: 'patch',
    regenerator: true,
  },
  {
    name: 'to-string-x',
    identifier: 'patch',
  },
  {
    name: 'is-nan-x',
    identifier: 'patch',
  },
  {
    name: 'same-value-x',
    identifier: 'patch',
  },
  {
    name: 'same-value-zero-x',
    identifier: 'patch',
  },
  {
    name: 'is-nil-x',
    identifier: 'patch',
  },
  {
    name: 'infinity-x',
    identifier: 'patch',
  },
  {
    name: 'is-finite-x',
    identifier: 'patch',
  },
  {
    name: 'nan-x',
    identifier: 'patch',
  },
  {
    name: 'to-boolean-x',
    identifier: 'patch',
  },
  {
    name: 'is-truthy-x',
    identifier: 'patch',
  },
  {
    name: 'is-falsey-x',
    identifier: 'patch',
  },
  {
    name: 'attempt-x',
    identifier: 'patch',
  },
  {
    name: 'cached-constructors-x',
    identifier: 'patch',
  },
  {
    name: 'has-symbol-support-x',
    identifier: 'patch',
  },
  {
    name: 'to-string-tag-x',
    identifier: 'patch',
  },
  {
    name: 'has-boxed-string-x',
    identifier: 'patch',
  },
  {
    name: 'to-string-symbols-supported-x',
    identifier: 'patch',
  },
  {
    name: 'split-if-boxed-bug-x',
    identifier: 'patch',
  },
  {
    name: 'is-array-x',
    identifier: 'patch',
  },
  {
    name: 'require-object-coercible-x',
    identifier: 'patch',
  },
  {
    name: 'require-coercible-to-string-x',
    identifier: 'patch',
  },
  {
    name: 'regexp-escape-x',
    identifier: 'patch',
  },
  {
    name: 'has-to-string-tag-x',
    identifier: 'patch',
  },
  {
    name: 'white-space-x',
    identifier: 'patch',
  },
  {
    name: 'trim-left-x',
    identifier: 'patch',
  },
  {
    name: 'trim-right-x',
    identifier: 'patch',
  },
  {
    name: 'trim-x',
    identifier: 'patch',
  },
  {
    name: 'replace-comments-x',
    identifier: 'patch',
  },
  {
    name: 'normalize-space-x',
    identifier: 'patch',
  },
  {
    name: 'is-function-x',
    identifier: 'patch',
  },
  {
    name: 'is-object-like-x',
    identifier: 'patch',
  },
  {
    name: 'parse-int-x',
    identifier: 'patch',
  },
  {
    name: 'to-primitive-x',
    identifier: 'patch',
  },
  {
    name: 'to-number-x',
    identifier: 'patch',
  },
  {
    name: 'is-node-x',
    identifier: 'patch',
  },
  {
    name: 'modulo-x',
    identifier: 'patch',
  },
  {
    name: 'is-surrogate-pair-x',
    identifier: 'patch',
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

/**
 * Let's GO!
 *
 * @returns {Promise<boolean>} - Async.
 */
const letsGo = async () => {
  /**
   * GitHub login.
   *
   * @type {string}
   * */
  const GITHUB_LOGIN = readlineSync.question('Login: ');

  /**
   * GitHub password.
   *
   * @type {string}
   * */
  const GITHUB_PASSWORD = readlineSync.question('Password: ');

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
  const TITLE_TEXT = readlineSync.question('Title (:bookmark: vx.x.x)? ');

  /**
   * Text used for body of commit and for GitHub releases.
   *
   * @type {string}
   * */
  const BODY_TEXT = readlineSync.question('Body ()? ');

  /**
   * Remove local copy when completed.
   *
   * @type {boolean}
   * */
  const REMOVE_LOCAL_COPY = readlineSync.question('Remove local (yes)[no]? ').toLocaleString() !== 'no';

  /**
   * Do not push or publish.
   *
   * @type {boolean}
   * */
  const DRY_RUN = readlineSync.question('Dry run (yes)[no]? ').toLocaleString() !== 'no';

  if (DRY_RUN) {
    console.log();
    console.log('Dry run');
    console.log();
  }

  const projectUpdate = async (project) => {
    const {name, identifier, regenerator} = project;
    const repoURL = `${GITHUB_URL_PREFIX}/${name}.git`;
    console.log();
    console.log('------------------------------------------------------------');
    console.log(`Name: ${name}`);
    console.log('------------------------------------------------------------');
    console.log();
    const repoDir = `${TMP}/${name}`;

    /* Clone the GitHub repo. */
    console.log();
    console.log(`Cloning: ${repoURL}`);
    console.log();
    const cloneResult = shell.exec(`git clone ${repoURL} ${repoDir}`);

    if (cloneResult.code !== 0) {
      throw new Error(cloneResult.stderr);
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
    /* eslint-disable-next-line global-require,import/no-dynamic-require */
    const repoPackage = require(`../${repoDir}/package.json`);

    const modifiedRepoPackage = Object.keys(repoPackage).reduce((obj, key) => {
      const templateValue = templatePackage[key];

      obj[key] = typeof templateValue === 'undefined' ? repoPackage[key] : templateValue;

      return obj;
    }, {});

    const newRepoPackage = packageKeyOrder.reduce((obj, key) => {
      obj[key] = modifiedRepoPackage[key];

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
    salitaJSON.dependencies.forEach((obj) => {
      if (obj.isUpdateable) {
        newRepoPackage.dependencies[obj.name] = obj.after;
      }
    });

    /* Write the new repo package.json file. */
    console.log();
    console.log('Writing package.json');
    console.log();
    const repoJSON = `${JSON.stringify(newRepoPackage, null, 2).replace(/{PACKAGE_NAME}/gm, name)}\n`;
    fs.writeFileSync(`${repoDir}/package.json`, repoJSON);

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
      const semver = new SemVer(newRepoPackage.version).inc(identifier);
      newRepoPackage.version = semver.toString();

      /* Write the new repo package.json file. */
      console.log();
      console.log('Writing package.json');
      console.log();
      const repoSemverJSON = `${JSON.stringify(newRepoPackage, null, 2).replace(/{PACKAGE_NAME}/gm, name)}\n`;
      fs.writeFileSync(`${repoDir}/package.json`, repoSemverJSON);

      /* Run npm install on the repo. */
      console.log();
      console.log('Running npm install');
      console.log();
      const npmInstallResult = shell.exec(`cd ${repoDir} && npm install`);

      if (npmInstallResult.code !== 0) {
        throw new Error(npmInstallResult.stderr);
      }

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

      /* Add the git changes.* */
      console.log();
      console.log('Running git add -A');
      console.log();
      const addResult = shell.exec(`cd ${repoDir} && git add -A`);

      if (addResult.code !== 0) {
        throw new Error(addResult.stderr);
      }

      /* Commit the git changes. */
      console.log();
      console.log('Running git commit');
      console.log();
      const commitBody = BODY_TEXT ? ` -m "${BODY_TEXT}"` : '';
      const commitTitle = TITLE_TEXT || `:bookmark: v${newRepoPackage.version}`;
      const commitCmd = `git commit -m "${commitTitle}"${commitBody}`;
      const commitResult = shell.exec(`cd ${repoDir} && ${commitCmd}`);

      if (commitResult.code !== 0) {
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

        /* Publish NPM. */
        console.log();
        console.log('Running npm publish');
        console.log();
        const publishResult = shell.exec(`cd ${repoDir} && npm publish`);

        if (publishResult.code !== 0) {
          throw new Error(publishResult.stderr);
        }
      }

      /* Publish GitHub release. */
      console.log();
      console.log('GitHub release');
      console.log();
      const remoteRepo = GITHUB_API.getUser().getRepo(GITHUB_REPO_PREFIX, name);
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

            console.log(' GitHub release created');
          },
        );
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
  };

  projects.forEach(projectUpdate);

  /* Remove TMP. */
  if (REMOVE_LOCAL_COPY) {
    console.log();
    console.log(`Running rm -rf ${TMP}`);
    console.log();
    const rmTmpResult = shell.rm('-rf', TMP);

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
