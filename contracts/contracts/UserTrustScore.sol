// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title UserTrustScore
 * @dev Хэрэглэгчийн итгэлцлийн оноо хадгалах энгийн жишээ гэрээ
 */
contract UserTrustScore {
    // userAddress -> trustScore (эерэг, сөрөг, 0 г.м.)
    mapping(address => int256) public userScore;

    // Fundraising гэрээний хаяг – зөвхөн тэр гэрээнээс оноо нэмэх/хасахыг зөвшөөрнө
    address public fundraisingContract;

    // Эвентүүд
    event ScoreIncreased(address indexed user, int256 amount, int256 newScore);
    event ScoreDecreased(address indexed user, int256 amount, int256 newScore);

    constructor(address _fundraisingContract) {
        fundraisingContract = _fundraisingContract;
    }

    // ------------------------------------------------
    // 0 оноотой (анх удаа) хэрэглэгчид 3 оноо олгох
    // ------------------------------------------------
    // Анхаарах зүйл: Энэ функцийг FundraisingContract‐аас дуудах бол
    // onlyFundraising() модифиертой эсвэл public байдлаар зохицуулна.
    function setInitialScoreIfNone(address user) external onlyFundraising {
        int256 currentScore = userScore[user];
        if (currentScore == 0) {
            userScore[user] = 3;
            emit ScoreIncreased(user, 3, 3);
        }
    }

    modifier onlyFundraising() {
        require(
            msg.sender == fundraisingContract,
            "Only FundraisingContract can call"
        );
        _;
    }

    /**
     * @notice Хэрэглэгчийн оноог нэмэх (Fundraising гэрээнээс дуудагдана)
     * @param user   Оноо нэмэх хэрэглэгч
     * @param amount Хэдэн оноо нэмэх (жишээ нь 5)
     */
    function increaseScore(
        address user,
        int256 amount
    ) external onlyFundraising {
        userScore[user] += amount;
        emit ScoreIncreased(user, amount, userScore[user]);
    }

    /**
     * @notice Хэрэглэгчийн оноог хасах (Fundraising гэрээнээс дуудагдана)
     * @param user   Оноо хасах хэрэглэгч
     * @param amount Хэдэн оноо хасах (жишээ нь 3)
     */
    function decreaseScore(
        address user,
        int256 amount
    ) external onlyFundraising {
        userScore[user] -= amount;
        emit ScoreDecreased(user, amount, userScore[user]);
    }
}
