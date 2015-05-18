#!/bin/sh

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
URL="https://connect.facebook.net/en_US/fbds.js"
TMPFILE=/tmp/fbds-`date +%s`.js
DSTFILE=${DIR}/fbds.js
COMMENTS_HEAD="/* DO NOT MODIFY THIS FILE!
 * This is file is generated & minified from ${URL}
 * Regenerate it with update_fbds.sh
*/
/* jshint ignore:start */
"
COMMENTS_FOOT="
/* jshint ignore:end */"

curl -s ${URL} >${TMPFILE}
echo "${COMMENTS_HEAD}" >${DSTFILE}
cat ${TMPFILE} | sed -e "s/g='https:\\/\\/www.facebook.com\\/tr\\/'/g='\\/tr'/g" >>${DSTFILE}
echo "${COMMENTS_FOOT}" >>${DSTFILE}
echo 'done!'
