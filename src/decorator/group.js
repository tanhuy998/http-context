const metadata = require('isln/src/utils/metadata');
const RouteGroup = require('../utils/route/routeGroup');
const { initRouteGroup } = require('../utils/route/route.utils');

/**@type {RouteGroup} */
var currGroup;

function group(..._paths) {

    currGroup = new RouteGroup(..._paths);

    return function(_, context) {

        const {kind} = context;

        if (kind !== 'class') {

            throw new Error('invalid use of @group');
        }

        initRouteGroup(_, currGroup);

        currGroup.setController(_);

        delete currGroup;

        return _;
    }
}

/**
 * 
 * @returns {RouteGroup?}
 */
function currentGroup() {

    return currGroup;
}

module.exports = {group, currentGroup};