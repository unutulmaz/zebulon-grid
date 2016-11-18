import React from 'react';

export const RightArrow = ({ zoom }) => <img alt="right arrow" height={`${16 * zoom || 16}`} width={`${16 * zoom || 16}`} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAA8hJREFUeJzt3U+snGMUx/Ev4l+IUiRENFJK/FsQG7EiNiJhI3aIFRZ2LIVYCYuuxE4aNqohEawQCyQWYqORlJCmQsSfuk1L46b6WNxOeju9M/O+77znOTP3/X6Ssz/n+Z2ZO7l5Zx6QJEmSJEmSJEmSJEmSJEmSJEmKdSPwAfAPcBjYDVyV2pGq2QEcBMpYHQBuTuxLlezh9PBHtQLck9eaajjE5AUowCrwWFp3Cjct/PX1QlJ/CtZ0AQqwCzg7pUuFabMABfgE2JLSqUK0XYAC7AW2ZTSr/nVZgAL8Atye0K961nUBCnAEuL9+y+rTPAtQgGPAU9W7Vm/mXYBRvQycUbl39aCvBSjA28B5ddvXvPpcgAJ8DlxadQLNpe8FKMB3wHU1h1B3EQtQgN+BOyvOoY6iFqAAR4GH6o2iLiIXoADHgWeqTaPWohdgVK8CZ1WaSS3UWoACvA9cUGcsNVVzAQrwFXBFlcnUSO0FKMB+4KYKs6mBjAUowF/A3RXm0wxZC1CAf4FH4kfUNJkLMKrnwqfURNnhj+p1fN4wRXbw6+sj4KLYcTUuO/Tx+ga4OnRinSI78I3qZ+C2yKF1UnbYk+owcF/g3DohO+hpdQx4Im50QX7ITeolfN4wTHa4Test4NygMxi07GDb1GfA1phjGK7sUNvWPmB7yEkMVHagXeo34JaIw+jbMnxwKdkNdPQjcCtrv2u0sM7MbmAT2w48md3ELC5ArIV/4tg/AbFWgEuym5jGd4BYC/8CcwFi7ctuYBYXINY72Q3MsvBvUSzvZ4CfWHuy+Eh2I9P4DhDjIPAgCx7+ssj+r17b+gG4IeQkBio70Db1JXB5zDEMV3aoTetd4PygMxi07GCb1E78PBUmO9xp9R/wdNzogvyQJ9XfwAOBc+uE7KA3ql+BOyKH1knZYY/Xt8A1kQPrVNmBr69PgYtjx9W47NBH9QZwTvCs2kB28AV4MXxKTZQZ/CrwePyImiYr/EPAvRXm0wwZ4R9gSR7rHoLa4X8NXFllMjVSM/wPgQvrjKWmaoX/Gv5U7EKKDv448Gy1adRaZPhHgYfrjaIuosL/A7ir4hzqKCL874EdNYdQd32H/wVwWdUJNJc+w9+D18Ytnb7Cf4Xl+CKMxswbvFfHLrl5wvfy6E2ga/heH79JdAl/L7Ato1n1r234HwNbUjpViDbh78JLHTadpuE/n9WgYq0wPfhV4NG07hRuN5PD92q3AbgW+JPTw9+PlzsOxvXAe6x9IXMFeBOvd5UkSZIkSZIkSZIkSZIkSZIkSQP3P67zIioC2pN2AAAAAElFTkSuQmCC" />;
export const DownArrow = ({ zoom }) => <img alt="down arrow" height={`${16 * zoom || 16}`} width={`${16 * zoom || 16}`} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAvxJREFUeJzt3E2ID3Ecx/G3xw152oM8JQ+Rh5DDlptyECfl6OAiOXo4iYOLkps4Ui5byMFDe6AUkQMupEhKREJ5WLLlYZfDcFHs/uc/8/vOzP/9qs91Z+bzmXbb+c8uSJIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZKkTrMYOAf0Az/Nf/MROAssytV0BS0D3hNfbN3yDliSo+/K6SO+zLrmYo6+WzKq7AMAA8CEBMdpogFgUpkHGF3mF/9tMMExmupH2QdIcQP0JThGUzWiu9nAC+J/ntYtz4FZOfqupJX4K2Ar+QisyNV0hW0AvhNfbtXzDVifs+PK2058wVXPttzt1sQh4kuuag620Wut9BJfdtVyqq1Ga2Y8cJ340quSq8C4dgqto+nAI+LLj84DYGqbXdbWAuAN8SNE5RUwr+0Wa64H+EL8GKnzGVhTQH+NsJnsM4PoUVLlB7CpkOYaZBfxw6TKzoI6a5yjxI9Tdo4U1lYDjQbOEz9SWTlDmncwam0CcJv4sYrOTaCrwJ4abQbwlPjRispjoLvQhjrAUprxMulbYGHB3XSMdcBX4kfMmwFgbeGtdJitwBDxY7aaQWBLCX10pAPED9pq9pTSRAc7SfyoI82xkjroaGOBK8SPO1wukOZt6440BbhP/Mj/yh1gYmlXLwDmAi+JH/vvPCV7fqEEVgOfiB/9T96TPbdQQhupxmvmX8meVyjADmLHHyJ7TqFAh4m7AfYnuD4NYxRwmvTjn0hxcRqZLuAG6ca/TPZcQhXSTfaxa9nj3wMmJ7omtWgR2cevZY3/ApiT7GqUy1qyj2GLHr8fWJXwOtSGLRT7mvl3sj9vV43spbgbYHvic1dBjtP++IeSn7UKMwa4RP7xe9Ofsoo2EbhL6+NfI/szdjXATOAZIx//ITAt4kRVnuXAB4Yf/zUwP+YUVbYe/v8yyROyG0UNNgXYR/b6Vj/Zd4VbwG78n8aSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJCnQL74K1b7KD2ipAAAAAElFTkSuQmCC" />;
