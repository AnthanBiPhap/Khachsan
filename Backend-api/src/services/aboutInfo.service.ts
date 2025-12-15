import createError from "http-errors";
import AboutInfo from "../models/aboutInfo.model";

/**
 * Lấy thông tin về chúng tôi (chỉ có 1 document)
 */
const get = async () => {
  let aboutInfo = await AboutInfo.findOne();

  // Nếu chưa có thì tạo mới với giá trị mặc định
  if (!aboutInfo) {
    aboutInfo = new AboutInfo();
    await aboutInfo.save();
  }

  return aboutInfo;
};

/**
 * Cập nhật thông tin về chúng tôi
 */
const update = async (payload: any) => {
  let aboutInfo = await AboutInfo.findOne();

  // Nếu chưa có thì tạo mới
  if (!aboutInfo) {
    aboutInfo = new AboutInfo();
  }

  // Cập nhật từng trường một cách linh hoạt
  if (payload.heroTitle !== undefined) {
    aboutInfo.heroTitle = payload.heroTitle;
  }
  if (payload.heroDescription !== undefined) {
    aboutInfo.heroDescription = payload.heroDescription;
  }
  if (payload.heroImage !== undefined) {
    aboutInfo.heroImage = payload.heroImage;
  }

  // Cập nhật stats
  if (payload.stats) {
    if (payload.stats.yearsExperience) {
      if (payload.stats.yearsExperience.number !== undefined) {
        aboutInfo.stats.yearsExperience.number = payload.stats.yearsExperience.number;
      }
      if (payload.stats.yearsExperience.label !== undefined) {
        aboutInfo.stats.yearsExperience.label = payload.stats.yearsExperience.label;
      }
    }
    if (payload.stats.rooms) {
      if (payload.stats.rooms.number !== undefined) {
        aboutInfo.stats.rooms.number = payload.stats.rooms.number;
      }
      if (payload.stats.rooms.label !== undefined) {
        aboutInfo.stats.rooms.label = payload.stats.rooms.label;
      }
    }
    if (payload.stats.satisfiedCustomers) {
      if (payload.stats.satisfiedCustomers.number !== undefined) {
        aboutInfo.stats.satisfiedCustomers.number = payload.stats.satisfiedCustomers.number;
      }
      if (payload.stats.satisfiedCustomers.label !== undefined) {
        aboutInfo.stats.satisfiedCustomers.label = payload.stats.satisfiedCustomers.label;
      }
    }
    if (payload.stats.averageRating) {
      if (payload.stats.averageRating.number !== undefined) {
        aboutInfo.stats.averageRating.number = payload.stats.averageRating.number;
      }
      if (payload.stats.averageRating.label !== undefined) {
        aboutInfo.stats.averageRating.label = payload.stats.averageRating.label;
      }
    }
  }

  // Cập nhật introduction
  if (payload.introduction) {
    if (payload.introduction.title !== undefined) {
      aboutInfo.introduction.title = payload.introduction.title;
    }
    if (payload.introduction.description !== undefined) {
      aboutInfo.introduction.description = payload.introduction.description;
    }
  }

  // Cập nhật story
  if (payload.story) {
    if (payload.story.title !== undefined) {
      aboutInfo.story.title = payload.story.title;
    }
    if (payload.story.paragraph1 !== undefined) {
      aboutInfo.story.paragraph1 = payload.story.paragraph1;
    }
    if (payload.story.paragraph2 !== undefined) {
      aboutInfo.story.paragraph2 = payload.story.paragraph2;
    }
    if (payload.story.image !== undefined) {
      aboutInfo.story.image = payload.story.image;
    }
  }

  // Cập nhật mission
  if (payload.mission) {
    if (payload.mission.title !== undefined) {
      aboutInfo.mission.title = payload.mission.title;
    }
    if (payload.mission.description !== undefined) {
      aboutInfo.mission.description = payload.mission.description;
    }
  }

  // Cập nhật vision
  if (payload.vision) {
    if (payload.vision.title !== undefined) {
      aboutInfo.vision.title = payload.vision.title;
    }
    if (payload.vision.description !== undefined) {
      aboutInfo.vision.description = payload.vision.description;
    }
  }

  // Cập nhật features (mảng)
  if (payload.features !== undefined && Array.isArray(payload.features)) {
    aboutInfo.features = payload.features;
  }

  // Cập nhật team
  if (payload.team) {
    if (payload.team.title !== undefined) {
      aboutInfo.team.title = payload.team.title;
    }
    if (payload.team.description !== undefined) {
      aboutInfo.team.description = payload.team.description;
    }
    if (payload.team.members !== undefined && Array.isArray(payload.team.members)) {
      aboutInfo.team.members = payload.team.members;
    }
  }

  const updatedAboutInfo = await aboutInfo.save();
  return updatedAboutInfo;
};

export default {
  get,
  update,
};

