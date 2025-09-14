import sql from "../config/db.js";

export const getUserCreations = async (req, res) => {
  try {
    const { userId } = req.auth();

    const creation =
      await sql`SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`;
    return res.json({ success: true, creation });
  } catch (error) {
    console.log("Error in getUserCreations controller:", error.message);
    return res.json({ success: false, message: error.message });
  }
};

export const getPublishedCreations = async (req, res) => {
  try {
    const { userId } = req.auth();
    const creation = await sql`
      SELECT * FROM creations
      WHERE user_id = ${userId} AND publish = true
      ORDER BY created_at DESC
    `;
    return res.json({ success: true, creation });
  } catch (error) {
    console.log("Error in getPublishedCreations controller:", error.message);
    return res.json({ success: false, message: error.message });
  }
};

export const toggleLikeCreations = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const [creation] = await sql`SELECT * FROM creations WHERE id = ${id}`;

    if (!creation) {
      return res.json({ success: false, message: "Creation not found" });
    }

    const currentLikes = creation.likes || [];
    const userIdStr = userId.toString();
    let updatedLikes;
    let message;

    if (currentLikes.includes(userIdStr)) {
      // Unlike
      updatedLikes = currentLikes.filter((user) => user !== userIdStr);
      message = "Creation unliked";
    } else {
      // Like
      updatedLikes = [...currentLikes, userIdStr];
      message = "Creation liked";
    }

    const formattedArray = `{${updatedLikes.join(",")}}`;

    await sql`UPDATE creations SET likes = ${formattedArray}::text[] WHERE id = ${id}`;

    return res.json({ success: true, message, likes: updatedLikes });
  } catch (error) {
    console.log("Error in toggleLikeCreations controller:", error.message);
    return res.json({ success: false, message: error.message });
  }
};
