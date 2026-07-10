/** @format */

const httpStatus = require("http-status");
const { Video } = require("../../models");
const ApiError = require("../../utils/ApiError");
const vimeoClient = require("../../config/vimeoClient");

const createVideo = async (body) => {
	const { title, vimeo_video_id } = body;

	const video = await Video.create({
		title,
		vimeo_video_id,
		video_url: `https://player.vimeo.com/video/${vimeo_video_id}`,
	});

	if (!video) {
		throw new ApiError(
			httpStatus.INTERNAL_SERVER_ERROR,
			"Video creation failed",
		);
	}

	return video;
};

const getAllVideos = async () => {
	return Video.findAll({ where: { is_active: true } });
};

const getVimeoDownloadLink = (vimeoVideoId) => {
  return new Promise((resolve, reject) => {
    vimeoClient.request(
      {
        method: "GET",
        path: `/videos/${vimeoVideoId}`,
      },
      (error, body) => {
        if (error) return reject(error);

        if (!body.download || !body.download.length) {
          return reject(
            new ApiError(
              httpStatus.FORBIDDEN,
              "Downloads not enabled for this video"
            )
          );
        }

        // Prefer HD if available
        const best =
          body.download.find(d => d.quality === "hd") || body.download[0];

        resolve(best.link);
      }
    );
  });
};

const downloadVideo = async (videoId) => {
  const video = await Video.findOne({ where: { vimeo_video_id: videoId } });

  if (!video) {
    throw new ApiError(httpStatus.NOT_FOUND, "Video not found");
  }

  const downloadUrl = await getVimeoDownloadLink(video.vimeo_video_id);

  return downloadUrl;
};

module.exports = {
	createVideo,
	getAllVideos,
    downloadVideo
};
