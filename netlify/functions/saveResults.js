const fetch = require("node-fetch");

exports.handler = async function(event) {
  try {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const repo = "kareemretetert/third-year-secondary-website";
    const path = "results.json";

    // النتيجة الجديدة القادمة من الطالب
    const newResult = JSON.parse(event.body);

    // 🔹 جلب الملف الحالي من GitHub
    const fileRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json"
      }
    });

    if (fileRes.status !== 200) {
      return {
        statusCode: 500,
        body: "فشل تحميل results.json من GitHub"
      };
    }

    const fileData = await fileRes.json();
    const sha = fileData.sha;

    // 🔹 قراءة النتائج الحالية وتحويلها من base64
    let currentResults = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));
    if (!Array.isArray(currentResults)) currentResults = [];

    // 🔹 إضافة النتيجة الجديدة
    currentResults.push(newResult);

    // 🔹 تحويل البيانات الجديدة إلى base64
    const updatedContent = Buffer.from(JSON.stringify(currentResults, null, 2)).toString('base64');

    // 🔹 رفع الملف المحدّث إلى GitHub
    const updateRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json"
      },
      body: JSON.stringify({
        message: `إضافة نتيجة جديدة للطالب ${newResult.name}`,
        content: updatedContent,
        sha: sha,
        branch: "main"
      })
    });

    if (!updateRes.ok) {
      const err = await updateRes.json();
      return { statusCode: 500, body: JSON.stringify(err) };
    }

    return { statusCode: 200, body: "تم حفظ النتيجة بنجاح ✅" };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};
