const fetch = require("node-fetch");

exports.handler = async (event) => {

  try {

    const data = JSON.parse(event.body);

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const OWNER = "kareemretetert"; // اسمك على GitHub
    const REPO = "third-year-secondary-website"; // اسم الريبو
    const PATH = "results.json";

    // 🔹 نجيب الملف الحالي
    const getFile = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json"
        }
      }
    );

    const fileData = await getFile.json();

    const sha = fileData.sha;

    // 🔹 نحول البيانات لـ base64
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");

    // 🔹 نحدث الملف
    await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json"
        },
        body: JSON.stringify({
          message: "update results",
          content: content,
          sha: sha
        })
      }
    );

    return {
      statusCode: 200,
      body: "Saved"
    };

  } catch (error) {

    return {
      statusCode: 500,
      body: error.toString()
    };

  }

};
