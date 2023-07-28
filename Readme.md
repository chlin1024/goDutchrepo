- # goDutch

  ![logo](/build/assets/img/team-1.jpg)
  輕鬆分帳，輕鬆享受生活！

  體驗我們的分帳軟體，輕鬆追蹤、記錄和結算共同花費，讓您的帳目清晰有序，更方便與朋友、家人共同管理財務！

- ## Description
  goDutch is an bill splitting tool that attempts to solve bills splitting problems among a group of people that minimize the number of transactions through greedy algorithm.
- ## Features
  - Payment groups
    ![group_invite_gif](/build/assets/img/group_invite.gif)
  - Create payments
    ![create_payment_gif](/build/assets/img/create_payment.gif)
  - Debt simplication
    ![settlements](/build/assets/img/settlements.png)
  - Settlement Notification
    ![line_notify_gif](/build/assets/img/Line_notify.gif)
- ## Table schema
  ![table_schema](/build/assets/img/table_schema.png)
- ## Algorithm

  - In a group bill spliting situation, there are two characteristic:
    1. The sum of every person in a group must be 0.
    2. Assume every person in a group can conduct transcation with each other.
  - Debts relationship are reduce by computing total amount every person spent, and taken into account the amount every person is owed.
  - Using greedy algorithm to minimize edge between debts network is to send as much money as possible in every edge.
    - Find the person who owes the most money
    - Find the person who paid the most money
    - Have the person who owes the most money return as much money as possible
    - Update the net balance of all individuals involved in the transaction.
  - By following this algorithm iteratively, we gradually settle the debts and reduce the net balances of the individuals involved until everyone's net balance becomes zero, indicating that all debts have been settled.

  - This algorithm can efficiently minimize the number of transactions needed to settle all debts because it focuses on maximizing the amount transferred in each transaction,

- ## Getting Started

  - Demo account
    Sign in page : http://www.cphoebelin.com/user/signin

  ```
  Account email : exmaple01@gmail.com
  Password : 1234rewq
  ```

  Link with Line Notify

- ## Installation
