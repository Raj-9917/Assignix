import Course from '../models/Course.js';
import Problem from '../models/Problem.js';

// @desc    Global search for courses, problems, and users
// @route   GET /api/search
// @access  Private
export const globalSearch = async (req, res) => {
  const { query } = req.query;

  if (!query || query.length < 2) {
    return res.status(400).json({ message: 'Search query must be at least 2 characters long' });
  }

  try {
    const regex = new RegExp(query, 'i');

    // Parallel search for efficiency
    const [courses, problems] = await Promise.all([
      Course.find({ 
        $or: [
          { title: regex },
          { category: regex },
          { description: regex }
        ]
      }).limit(5),
      Problem.find({
        $or: [
          { title: regex },
          { category: regex },
          { tags: regex }
        ]
      }).limit(5)
    ]);

    res.json({
      courses,
      problems
    });
  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
