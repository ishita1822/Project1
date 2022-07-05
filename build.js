const path = require('path');

// only for platform-launchpad-ui repository
const staticIndexPageFilePath = path.resolve(__dirname, '..', 'index-dt.html');

const { BuildMonorepo, BuildUtils } = require('Jenkins_Test_2');

(async () => {
    try {
        await BuildMonorepo.execute({ rootPath: path.join(__dirname, '..'), staticIndexPageFilePath });
    } catch (e) {
        BuildUtils.exit(e);
    }
})();
