const { getTeamSummary, answerNaturalQuery } = require('../services/aiService');

const chatWithAssistant = async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }

    const result = await answerNaturalQuery({ query, user: req.user });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getSummary = async (req, res, next) => {
  try {
    const { weekNumber, year } = req.query;
    const summary = await getTeamSummary({ weekNumber, year });

    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chatWithAssistant,
  getSummary
};
