using Oppora.API.Models.MockTest;

namespace Oppora.API.Session
{
    public class TestSessionManager
    {
        private readonly Dictionary<string, List<Question>> _activeTests = new();

        public void SaveTest(string sessionId, List<Question> questions)
        {
            _activeTests[sessionId] = questions;
        }

        public List<Question>? GetTest(string sessionId)
        {
            if (_activeTests.TryGetValue(sessionId, out var questions))
            {
                return questions;
            }

            return null;
        }

        public void RemoveTest(string sessionId)
        {
            _activeTests.Remove(sessionId);
        }

        public bool SessionExists(string sessionId)
        {
            return _activeTests.ContainsKey(sessionId);
        }
    }
}