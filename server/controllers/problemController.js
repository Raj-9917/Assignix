import Problem from '../models/Problem.js';

// @desc    Get all problems
// @route   GET /api/problems
// @access  Public
export const getProblems = async (req, res) => {
  try {
    const problems = await Problem.find({}).sort('-createdAt');
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single problem by ID/Slug
// @route   GET /api/problems/:id
// @access  Public
export const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findOne({ id: req.params.id });
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a problem (Admin only)
// @route   POST /api/problems
// @access  Private/Admin
export const createProblem = async (req, res) => {
  const { id, title, difficulty, category, course, tags, description, examples, constraints, testCases, starterCode } = req.body;

  try {
    const problemExist = await Problem.findOne({ id });
    if (problemExist) {
        return res.status(400).json({ message: 'Problem ID already exists' });
    }

    const problem = new Problem({
      id,
      title,
      difficulty,
      category,
      course,
      tags,
      description,
      examples,
      constraints,
      testCases,
      starterCode
    });

    const createdProblem = await problem.save();
    res.status(201).json(createdProblem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a problem (Admin only)
// @route   PUT /api/problems/:id
// @access  Private/Admin
export const updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findOne({ id: req.params.id });

    if (problem) {
      const { title, difficulty, category, course, tags, description, examples, constraints, testCases, starterCode } = req.body;

      problem.title = title || problem.title;
      problem.difficulty = difficulty || problem.difficulty;
      problem.category = category || problem.category;
      problem.course = course || problem.course;
      problem.tags = tags || problem.tags;
      problem.description = description || problem.description;
      problem.examples = examples || problem.examples;
      problem.constraints = constraints || problem.constraints;
      problem.testCases = testCases || problem.testCases;
      problem.starterCode = starterCode || problem.starterCode;

      const updatedProblem = await problem.save();
      res.json(updatedProblem);
    } else {
      res.status(404).json({ message: 'Problem not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a problem (Admin only)
// @route   DELETE /api/problems/:id
// @access  Private/Admin
export const deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findOne({ id: req.params.id });

    if (problem) {
      await problem.deleteOne();
      res.json({ message: 'Problem removed' });
    } else {
      res.status(404).json({ message: 'Problem not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
