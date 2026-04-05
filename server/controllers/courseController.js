import Course from '../models/Course.js';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).sort('-createdAt');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single course by ID/Slug
// @route   GET /api/courses/:id
// @access  Public
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findOne({ id: req.params.id });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a course (Admin only)
// @route   POST /api/courses
// @access  Private/Admin
export const createCourse = async (req, res) => {
  const { title, id, description, category, thumbnail, color, difficulty } = req.body;

  try {
    const courseExist = await Course.findOne({ id });
    if (courseExist) {
        return res.status(400).json({ message: 'Course ID already exists' });
    }

    const course = new Course({
      title,
      id,
      description,
      category,
      thumbnail,
      color,
      difficulty,
      instructor: req.user._id
    });

    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a course (Admin only)
// @route   PUT /api/courses/:id
// @access  Private/Admin
export const updateCourse = async (req, res) => {
  const { title, description, category, thumbnail, color, difficulty } = req.body;

  try {
    const course = await Course.findOne({ id: req.params.id });

    if (course) {
      course.title = title || course.title;
      course.description = description || course.description;
      course.category = category || course.category;
      course.thumbnail = thumbnail || course.thumbnail;
      course.color = color || course.color;
      course.difficulty = difficulty || course.difficulty;

      const updatedCourse = await course.save();
      res.json(updatedCourse);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a course (Admin only)
// @route   DELETE /api/courses/:id
// @access  Private/Admin
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findOne({ id: req.params.id });

    if (course) {
      await course.deleteOne();
      res.json({ message: 'Course removed' });
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
