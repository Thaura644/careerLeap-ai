package com.leapai.backend.config;

import com.leapai.backend.model.Problem;
import com.leapai.backend.repository.ProblemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds the practice problem set on first boot (idempotent by slug). Every
 * problem carries real hidden test cases — the judge runs actual code against
 * them; nothing here is mocked.
 */
@Component
public class ProblemSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(ProblemSeeder.class);

    private final ProblemRepository problems;

    public ProblemSeeder(ProblemRepository problems) {
        this.problems = problems;
    }

    @Override
    public void run(String... args) {
        int created = 0;
        for (Problem p : ALL) {
            if (problems.findBySlug(p.getSlug()).isPresent()) continue;
            problems.save(p);
            created++;
        }
        if (created > 0) {
            log.info("[seeder] created {} practice problem(s)", created);
        }
    }

    private static Problem problem(String slug, String title, String difficulty, String category,
                                   String signature, String methodName, String starter, String desc,
                                   String samples, String hidden) {
        Problem p = new Problem();
        p.setSlug(slug);
        p.setTitle(title);
        p.setDifficulty(Problem.Difficulty.valueOf(difficulty));
        p.setCategory(category);
        p.setSignature(signature);
        p.setMethodName(methodName);
        p.setStarterCode(starter);
        p.setDescription(desc);
        p.setSampleCasesJson(samples);
        p.setTestCasesJson(hidden);
        p.setTimeLimitMs(2000);
        p.setMemoryLimitMb(256);
        return p;
    }

    // Expected values use Java's canonical string forms (Arrays.toString/List.toString style).

    private static final String TWO_SUM_STARTER = """
            import java.util.*;

            public class Solution {
                public static int[] twoSum(int[] nums, int target) {
                    // Return the indices of the two numbers that add up to target.
                    return new int[0];
                }
            }
            """;

    private static final String TWO_SUM_DESC = """
            Given an array of integers nums and an integer target, return the indices
            of the two numbers that add up to target.

            You may assume each input has exactly one solution, and you may not use
            the same element twice. Return the answer in any order.

            Examples:
              Input:  nums = [2,7,11,15], target = 9   ->  [0, 1]
              Input:  nums = [3,2,4], target = 6       ->  [1, 2]
              Input:  nums = [3,3], target = 6         ->  [0, 1]
            """;

    private static final String VALID_PARENS_STARTER = """
            import java.util.*;

            public class Solution {
                public static boolean isValid(String s) {
                    // Return true if the parentheses/braces/brackets are balanced.
                    return false;
                }
            }
            """;

    private static final String VALID_PARENS_DESC = """
            Given a string s containing just the characters '(', ')', '{', '}', '[' and ']',
            determine if the input string is valid — every opening bracket has a matching
            closing bracket of the same type, in the correct order.

            Examples:
              "()"        -> true
              "()[]{}"    -> true
              "(]"        -> false
              "([)]"      -> false
              "{[]}"      -> true
            """;

    private static final String CONTAINS_DUP_STARTER = """
            import java.util.*;

            public class Solution {
                public static boolean containsDuplicate(int[] nums) {
                    // Return true if any value appears at least twice.
                    return false;
                }
            }
            """;

    private static final String CONTAINS_DUP_DESC = """
            Given an integer array nums, return true if any value appears at least twice
            in the array, and false if every element is distinct.

            Examples:
              [1,2,3,1]  -> true
              [1,2,3,4]  -> false
              [1,1,1,3,3,4,3,2,4,2] -> true
            """;

    private static final String PALINDROME_STARTER = """
            import java.util.*;

            public class Solution {
                public static boolean isPalindrome(int x) {
                    // Return true if x is a palindrome (reads the same forwards and backwards).
                    return false;
                }
            }
            """;

    private static final String PALINDROME_DESC = """
            Given an integer x, return true if x is a palindrome integer.

            Examples:
              121    -> true
              -121   -> false  (reads 121- backwards)
              10     -> false  (reads 01)
              1221   -> true
            """;

    private static final String BINARY_SEARCH_STARTER = """
            import java.util.*;

            public class Solution {
                public static int search(int[] nums, int target) {
                    // Return the index of target in the sorted array, or -1.
                    return -1;
                }
            }
            """;

    private static final String BINARY_SEARCH_DESC = """
            Given a sorted (ascending) integer array nums and a target value, return the
            index of target, or -1 if it is not present. The array is guaranteed sorted.

            Examples:
              nums = [-1,0,3,5,9,12], target = 9    ->  4
              nums = [-1,0,3,5,9,12], target = 2    ->  -1
              nums = [5], target = 5                ->  0
            """;

    private static final String BUY_SELL_STARTER = """
            import java.util.*;

            public class Solution {
                public static int maxProfit(int[] prices) {
                    // Return the max profit from one buy + one sell, or 0 if none.
                    return 0;
                }
            }
            """;

    private static final String BUY_SELL_DESC = """
            You are given an array prices where prices[i] is the price of a stock on day i.
            You may buy once and sell once on a later day. Return the maximum profit you
            can achieve, or 0 if no profit is possible.

            Examples:
              [7,1,5,3,6,4]  ->  5  (buy at 1, sell at 6)
              [7,6,4,3,1]    ->  0
              [2,4,1]        ->  2
            """;

    private static final String MAX_SUBARRAY_STARTER = """
            import java.util.*;

            public class Solution {
                public static int maxSubArray(int[] nums) {
                    // Return the largest sum of any contiguous subarray.
                    return 0;
                }
            }
            """;

    private static final String MAX_SUBARRAY_DESC = """
            Given an integer array nums, find the contiguous subarray (containing at least
            one number) which has the largest sum, and return its sum.

            Examples:
              [-2,1,-3,4,-1,2,1,-5,4]  ->  6   ([4,-1,2,1])
              [1]                      ->  1
              [5,4,-1,7,8]             ->  23
            """;

    private static final String REVERSE_STRING_STARTER = """
            import java.util.*;

            public class Solution {
                public static char[] reverseString(char[] s) {
                    // Return the characters in reverse order.
                    return new char[0];
                }
            }
            """;

    private static final String REVERSE_STRING_DESC = """
            Given a character array s, return a new array with the characters in reverse
            order. Do it without creating a second array if you can (mutate in place and
            return s).

            Examples:
              ['h','e','l','l','o']  ->  ['o','l','l','e','h']
              ['H','a','n','n','a','h']  ->  ['h','a','n','n','a','H']
            """;

    private static final String CLIMB_STAIRS_STARTER = """
            import java.util.*;

            public class Solution {
                public static int climbStairs(int n) {
                    // Return the number of distinct ways to climb to the top.
                    return 0;
                }
            }
            """;

    private static final String CLIMB_STAIRS_DESC = """
            You are climbing a staircase. It takes n steps to reach the top. Each time you
            can climb either 1 or 2 steps. Return the number of distinct ways you can
            climb to the top.

            Examples:
              n = 2  ->  2   (1+1, 2)
              n = 3  ->  3   (1+1+1, 1+2, 2+1)
              n = 4  ->  5
            """;

    private static final String VALID_ANAGRAM_STARTER = """
            import java.util.*;

            public class Solution {
                public static boolean isAnagram(String s, String t) {
                    // Return true if t is an anagram of s (same letters, same counts).
                    return false;
                }
            }
            """;

    private static final String VALID_ANAGRAM_DESC = """
            Given two strings s and t, return true if t is an anagram of s — the same
            characters in any order — and false otherwise.

            Examples:
              s = "anagram", t = "nagaram"  ->  true
              s = "rat",    t = "car"       ->  false
            """;

    private static final String LCP_STARTER = """
            import java.util.*;

            public class Solution {
                public static String longestCommonPrefix(String[] strs) {
                    // Return the longest common prefix shared by all strings, or "" if none.
                    return "";
                }
            }
            """;

    private static final String LCP_DESC = """
            Write a function to find the longest common prefix string among an array of
            strings. If there is no common prefix, return an empty string "".

            Examples:
              ["flower","flow","flight"]  ->  "fl"
              ["dog","racecar","car"]     ->  ""
            """;

    private static final String MAJORITY_STARTER = """
            import java.util.*;

            public class Solution {
                public static int majorityElement(int[] nums) {
                    // Return the element that appears more than n/2 times.
                    return 0;
                }
            }
            """;

    private static final String MAJORITY_DESC = """
            Given an array nums of size n, return the majority element — the element
            that appears more than n/2 times. You may assume the majority element
            always exists.

            Examples:
              [3,2,3]                ->  3
              [2,2,1,1,1,2,2]        ->  2
            """;

    private static final String HOUSE_ROBBER_STARTER = """
            import java.util.*;

            public class Solution {
                public static int rob(int[] nums) {
                    // Return the max amount you can rob without robbing adjacent houses.
                    return 0;
                }
            }
            """;

    private static final String HOUSE_ROBBER_DESC = """
            You are a robber planning to rob houses along a street. Each house has a
            certain amount of money stashed, and adjacent houses have a security system
            that alerts the police if two adjacent houses are robbed on the same night.

            Given an integer array nums of house amounts, return the maximum amount you
            can rob tonight without alerting the police.

            Examples:
              [1,2,3,1]          ->  4   (rob house 1 + house 3)
              [2,7,9,3,1]        ->  12  (rob house 1 + house 3 + house 5)
            """;

    private static final String WATER_STARTER = """
            import java.util.*;

            public class Solution {
                public static int maxArea(int[] height) {
                    // Return the max water a pair of lines can hold (area between them).
                    return 0;
                }
            }
            """;

    private static final String WATER_DESC = """
            You are given an integer array height of length n. Each element is a vertical
            line drawn at that x-coordinate. Find two lines that together with the x-axis
            form a container that holds the most water. Return the maximum amount of water
            it can store.

            Examples:
              [1,8,6,2,5,4,8,3,7]  ->  49
              [1,1]                 ->  1
            """;

    private static final String COIN_STARTER = """
            import java.util.*;

            public class Solution {
                public static int coinChange(int[] coins, int amount) {
                    // Return the fewest coins needed to make up amount, or -1 if impossible.
                    return -1;
                }
            }
            """;

    private static final String COIN_DESC = """
            You are given an integer array coins representing coins of different denominations
            and an integer amount. Return the fewest number of coins you need to make up that
            amount. If that amount cannot be made up by any combination of the coins, return -1.
            You may assume you have an unlimited number of each kind of coin.

            Examples:
              coins = [1,2,5], amount = 11   ->  3   (5 + 5 + 1)
              coins = [2], amount = 3        ->  -1
              coins = [1], amount = 0        ->  0
            """;

    private static final String TRAP_STARTER = """
            import java.util.*;

            public class Solution {
                public static int trap(int[] height) {
                    // Return how much water the elevation map can trap.
                    return 0;
                }
            }
            """;

    private static final String TRAP_DESC = """
            Given n non-negative integers representing an elevation map where the width of
            each bar is 1, compute how much water it can trap after raining.

            Examples:
              [0,1,0,2,1,0,1,3,2,1,2,1]  ->  6
              [4,2,0,3,2,5]               ->  9
            """;

    private static final List<Problem> ALL = List.of(
        problem("two-sum", "Two Sum", "EASY", "Arrays · Hash Map",
            "public static int[] twoSum(int[] nums, int target)",
            "twoSum", TWO_SUM_STARTER, TWO_SUM_DESC,
            """
            [{"call":"Solution.twoSum(new int[]{2,7,11,15}, 9)","expected":"[0, 1]"},
             {"call":"Solution.twoSum(new int[]{3,2,4}, 6)","expected":"[1, 2]"}]
            """,
            """
            [{"call":"Solution.twoSum(new int[]{2,7,11,15}, 9)","expected":"[0, 1]"},
             {"call":"Solution.twoSum(new int[]{3,2,4}, 6)","expected":"[1, 2]"},
             {"call":"Solution.twoSum(new int[]{3,3}, 6)","expected":"[0, 1]"},
             {"call":"Solution.twoSum(new int[]{1,2,3,4,5,6}, 11)","expected":"[4, 5]"},
             {"call":"Solution.twoSum(new int[]{-3,4,3,90}, 0)","expected":"[0, 2]"},
             {"call":"Solution.twoSum(new int[]{0,4,3,0}, 0)","expected":"[0, 3]"}]
            """),
        problem("valid-parentheses", "Valid Parentheses", "EASY", "Stack · Strings",
            "public static boolean isValid(String s)",
            "isValid", VALID_PARENS_STARTER, VALID_PARENS_DESC,
            """
            [{"call":"Solution.isValid(\\"()\\")","expected":"true"},
             {"call":"Solution.isValid(\\"()[]{}\\")","expected":"true"},
             {"call":"Solution.isValid(\\"(]\\")","expected":"false"}]
            """,
            """
            [{"call":"Solution.isValid(\\"()\\")","expected":"true"},
             {"call":"Solution.isValid(\\"()[]{}\\")","expected":"true"},
             {"call":"Solution.isValid(\\"(]\\")","expected":"false"},
             {"call":"Solution.isValid(\\"([)]\\")","expected":"false"},
             {"call":"Solution.isValid(\\"{[]}\\")","expected":"true"},
             {"call":"Solution.isValid(\\"(\\")","expected":"false"},
             {"call":"Solution.isValid(\\"((()))[]{}\\")","expected":"true"}]
            """),
        problem("contains-duplicate", "Contains Duplicate", "EASY", "Arrays · Hash Map",
            "public static boolean containsDuplicate(int[] nums)",
            "containsDuplicate", CONTAINS_DUP_STARTER, CONTAINS_DUP_DESC,
            """
            [{"call":"Solution.containsDuplicate(new int[]{1,2,3,1})","expected":"true"},
             {"call":"Solution.containsDuplicate(new int[]{1,2,3,4})","expected":"false"}]
            """,
            """
            [{"call":"Solution.containsDuplicate(new int[]{1,2,3,1})","expected":"true"},
             {"call":"Solution.containsDuplicate(new int[]{1,2,3,4})","expected":"false"},
             {"call":"Solution.containsDuplicate(new int[]{1,1,1,3,3,4,3,2,4,2})","expected":"true"},
             {"call":"Solution.containsDuplicate(new int[]{})","expected":"false"},
             {"call":"Solution.containsDuplicate(new int[]{7,7})","expected":"true"},
             {"call":"Solution.containsDuplicate(new int[]{-1,-2,-3,-1})","expected":"true"}]
            """),
        problem("palindrome-number", "Palindrome Number", "EASY", "Math",
            "public static boolean isPalindrome(int x)",
            "isPalindrome", PALINDROME_STARTER, PALINDROME_DESC,
            """
            [{"call":"Solution.isPalindrome(121)","expected":"true"},
             {"call":"Solution.isPalindrome(-121)","expected":"false"},
             {"call":"Solution.isPalindrome(10)","expected":"false"}]
            """,
            """
            [{"call":"Solution.isPalindrome(121)","expected":"true"},
             {"call":"Solution.isPalindrome(-121)","expected":"false"},
             {"call":"Solution.isPalindrome(10)","expected":"false"},
             {"call":"Solution.isPalindrome(1221)","expected":"true"},
             {"call":"Solution.isPalindrome(0)","expected":"true"},
             {"call":"Solution.isPalindrome(123454321)","expected":"true"},
             {"call":"Solution.isPalindrome(1000021)","expected":"false"}]
            """),
        problem("binary-search", "Binary Search", "EASY", "Binary Search",
            "public static int search(int[] nums, int target)",
            "search", BINARY_SEARCH_STARTER, BINARY_SEARCH_DESC,
            """
            [{"call":"Solution.search(new int[]{-1,0,3,5,9,12}, 9)","expected":"4"},
             {"call":"Solution.search(new int[]{-1,0,3,5,9,12}, 2)","expected":"-1"}]
            """,
            """
            [{"call":"Solution.search(new int[]{-1,0,3,5,9,12}, 9)","expected":"4"},
             {"call":"Solution.search(new int[]{-1,0,3,5,9,12}, 2)","expected":"-1"},
             {"call":"Solution.search(new int[]{5}, 5)","expected":"0"},
             {"call":"Solution.search(new int[]{5}, -5)","expected":"-1"},
             {"call":"Solution.search(new int[]{1,2,3,4,5,6,7,8,9,10}, 1)","expected":"0"},
             {"call":"Solution.search(new int[]{1,2,3,4,5,6,7,8,9,10}, 10)","expected":"9"}]
            """),
        problem("best-time-to-buy-sell-stock", "Best Time to Buy and Sell Stock", "EASY", "Arrays · Two Pointers",
            "public static int maxProfit(int[] prices)",
            "maxProfit", BUY_SELL_STARTER, BUY_SELL_DESC,
            """
            [{"call":"Solution.maxProfit(new int[]{7,1,5,3,6,4})","expected":"5"},
             {"call":"Solution.maxProfit(new int[]{7,6,4,3,1})","expected":"0"}]
            """,
            """
            [{"call":"Solution.maxProfit(new int[]{7,1,5,3,6,4})","expected":"5"},
             {"call":"Solution.maxProfit(new int[]{7,6,4,3,1})","expected":"0"},
             {"call":"Solution.maxProfit(new int[]{2,4,1})","expected":"2"},
             {"call":"Solution.maxProfit(new int[]{1})","expected":"0"},
             {"call":"Solution.maxProfit(new int[]{3,3,3})","expected":"0"},
             {"call":"Solution.maxProfit(new int[]{9,2,8,1,7})","expected":"6"}]
            """),
        problem("maximum-subarray", "Maximum Subarray", "MEDIUM", "Arrays · Dynamic Programming",
            "public static int maxSubArray(int[] nums)",
            "maxSubArray", MAX_SUBARRAY_STARTER, MAX_SUBARRAY_DESC,
            """
            [{"call":"Solution.maxSubArray(new int[]{-2,1,-3,4,-1,2,1,-5,4})","expected":"6"},
             {"call":"Solution.maxSubArray(new int[]{1})","expected":"1"}]
            """,
            """
            [{"call":"Solution.maxSubArray(new int[]{-2,1,-3,4,-1,2,1,-5,4})","expected":"6"},
             {"call":"Solution.maxSubArray(new int[]{1})","expected":"1"},
             {"call":"Solution.maxSubArray(new int[]{5,4,-1,7,8})","expected":"23"},
             {"call":"Solution.maxSubArray(new int[]{-1})","expected":"-1"},
             {"call":"Solution.maxSubArray(new int[]{-2,-1})","expected":"-1"},
             {"call":"Solution.maxSubArray(new int[]{3,-2,5,-1})","expected":"6"}]
            """),
        problem("reverse-string", "Reverse String", "EASY", "Strings · Two Pointers",
            "public static char[] reverseString(char[] s)",
            "reverseString", REVERSE_STRING_STARTER, REVERSE_STRING_DESC,
            """
            [{"call":"Solution.reverseString(new char[]{'h','e','l','l','o'})","expected":"[o, l, l, e, h]"},
             {"call":"Solution.reverseString(new char[]{'H','a','n','n','a','h'})","expected":"[h, a, n, n, a, H]"}]
            """,
            """
            [{"call":"Solution.reverseString(new char[]{'h','e','l','l','o'})","expected":"[o, l, l, e, h]"},
             {"call":"Solution.reverseString(new char[]{'H','a','n','n','a','h'})","expected":"[h, a, n, n, a, H]"},
             {"call":"Solution.reverseString(new char[]{})","expected":"[]"},
             {"call":"Solution.reverseString(new char[]{'a'})","expected":"[a]"},
             {"call":"Solution.reverseString(new char[]{'a','b'})","expected":"[b, a]"}]
            """),
        problem("climbing-stairs", "Climbing Stairs", "EASY", "Dynamic Programming",
            "public static int climbStairs(int n)",
            "climbStairs", CLIMB_STAIRS_STARTER, CLIMB_STAIRS_DESC,
            """
            [{"call":"Solution.climbStairs(2)","expected":"2"},
             {"call":"Solution.climbStairs(3)","expected":"3"}]
            """,
            """
            [{"call":"Solution.climbStairs(2)","expected":"2"},
             {"call":"Solution.climbStairs(3)","expected":"3"},
             {"call":"Solution.climbStairs(4)","expected":"5"},
             {"call":"Solution.climbStairs(1)","expected":"1"},
             {"call":"Solution.climbStairs(10)","expected":"89"},
             {"call":"Solution.climbStairs(20)","expected":"10946"}]
            """),
        problem("valid-anagram", "Valid Anagram", "EASY", "Strings · Hash Map",
            "public static boolean isAnagram(String s, String t)",
            "isAnagram", VALID_ANAGRAM_STARTER, VALID_ANAGRAM_DESC,
            """
            [{"call":"Solution.isAnagram(\\"anagram\\", \\"nagaram\\")","expected":"true"},
             {"call":"Solution.isAnagram(\\"rat\\", \\"car\\")","expected":"false"}]
            """,
            """
            [{"call":"Solution.isAnagram(\\"anagram\\", \\"nagaram\\")","expected":"true"},
             {"call":"Solution.isAnagram(\\"rat\\", \\"car\\")","expected":"false"},
             {"call":"Solution.isAnagram(\\"a\\", \\"a\\")","expected":"true"},
             {"call":"Solution.isAnagram(\\"\\", \\"\\")","expected":"true"},
             {"call":"Solution.isAnagram(\\"ab\\", \\"ba\\")","expected":"true"},
             {"call":"Solution.isAnagram(\\"aacc\\", \\"ccac\\")","expected":"false"},
             {"call":"Solution.isAnagram(\\"listen\\", \\"silent\\")","expected":"true"}]
            """),
        problem("longest-common-prefix", "Longest Common Prefix", "EASY", "Strings · Trie",
            "public static String longestCommonPrefix(String[] strs)",
            "longestCommonPrefix", LCP_STARTER, LCP_DESC,
            """
            [{"call":"Solution.longestCommonPrefix(new String[]{\\"flower\\",\\"flow\\",\\"flight\\"})","expected":"fl"},
             {"call":"Solution.longestCommonPrefix(new String[]{\\"dog\\",\\"racecar\\",\\"car\\"})","expected":""}]
            """,
            """
            [{"call":"Solution.longestCommonPrefix(new String[]{\\"flower\\",\\"flow\\",\\"flight\\"})","expected":"fl"},
             {"call":"Solution.longestCommonPrefix(new String[]{\\"dog\\",\\"racecar\\",\\"car\\"})","expected":""},
             {"call":"Solution.longestCommonPrefix(new String[]{\\"a\\"})","expected":"a"},
             {"call":"Solution.longestCommonPrefix(new String[]{\\"\\",\\"b\\"})","expected":""},
             {"call":"Solution.longestCommonPrefix(new String[]{\\"ab\\",\\"a\\"})","expected":"a"},
             {"call":"Solution.longestCommonPrefix(new String[]{\\"reflower\\",\\"flow\\",\\"flight\\"})","expected":""},
             {"call":"Solution.longestCommonPrefix(new String[]{\\"same\\",\\"same\\",\\"same\\"})","expected":"same"}]
            """),
        problem("majority-element", "Majority Element", "EASY", "Arrays · Hash Map",
            "public static int majorityElement(int[] nums)",
            "majorityElement", MAJORITY_STARTER, MAJORITY_DESC,
            """
            [{"call":"Solution.majorityElement(new int[]{3,2,3})","expected":"3"},
             {"call":"Solution.majorityElement(new int[]{2,2,1,1,1,2,2})","expected":"2"}]
            """,
            """
            [{"call":"Solution.majorityElement(new int[]{3,2,3})","expected":"3"},
             {"call":"Solution.majorityElement(new int[]{2,2,1,1,1,2,2})","expected":"2"},
             {"call":"Solution.majorityElement(new int[]{1})","expected":"1"},
             {"call":"Solution.majorityElement(new int[]{6,5,5})","expected":"5"},
             {"call":"Solution.majorityElement(new int[]{1,1,2,2,1})","expected":"1"},
             {"call":"Solution.majorityElement(new int[]{1,1,1,1,2,2,2,2,2})","expected":"2"},
             {"call":"Solution.majorityElement(new int[]{3,3,3,3,3,3})","expected":"3"}]
            """),
        problem("house-robber", "House Robber", "MEDIUM", "Arrays · Dynamic Programming",
            "public static int rob(int[] nums)",
            "rob", HOUSE_ROBBER_STARTER, HOUSE_ROBBER_DESC,
            """
            [{"call":"Solution.rob(new int[]{1,2,3,1})","expected":"4"},
             {"call":"Solution.rob(new int[]{2,7,9,3,1})","expected":"12"}]
            """,
            """
            [{"call":"Solution.rob(new int[]{1,2,3,1})","expected":"4"},
             {"call":"Solution.rob(new int[]{2,7,9,3,1})","expected":"12"},
             {"call":"Solution.rob(new int[]{1})","expected":"1"},
             {"call":"Solution.rob(new int[]{2,1,1,2})","expected":"4"},
             {"call":"Solution.rob(new int[]{5,3,4,11,2})","expected":"16"},
             {"call":"Solution.rob(new int[]{1,3,1,3,100})","expected":"103"},
             {"call":"Solution.rob(new int[]{0,0,0})","expected":"0"}]
            """),
        problem("container-with-most-water", "Container With Most Water", "MEDIUM", "Arrays · Two Pointers",
            "public static int maxArea(int[] height)",
            "maxArea", WATER_STARTER, WATER_DESC,
            """
            [{"call":"Solution.maxArea(new int[]{1,8,6,2,5,4,8,3,7})","expected":"49"},
             {"call":"Solution.maxArea(new int[]{1,1})","expected":"1"}]
            """,
            """
            [{"call":"Solution.maxArea(new int[]{1,8,6,2,5,4,8,3,7})","expected":"49"},
             {"call":"Solution.maxArea(new int[]{1,1})","expected":"1"},
             {"call":"Solution.maxArea(new int[]{4,3,2,1,4})","expected":"16"},
             {"call":"Solution.maxArea(new int[]{1,2,1})","expected":"2"},
             {"call":"Solution.maxArea(new int[]{1,2,4,3})","expected":"4"},
             {"call":"Solution.maxArea(new int[]{2,3,4,5,18,17,6})","expected":"17"}]
            """),
        problem("coin-change", "Coin Change", "MEDIUM", "Dynamic Programming",
            "public static int coinChange(int[] coins, int amount)",
            "coinChange", COIN_STARTER, COIN_DESC,
            """
            [{"call":"Solution.coinChange(new int[]{1,2,5}, 11)","expected":"3"},
             {"call":"Solution.coinChange(new int[]{2}, 3)","expected":"-1"},
             {"call":"Solution.coinChange(new int[]{1}, 0)","expected":"0"}]
            """,
            """
            [{"call":"Solution.coinChange(new int[]{1,2,5}, 11)","expected":"3"},
             {"call":"Solution.coinChange(new int[]{2}, 3)","expected":"-1"},
             {"call":"Solution.coinChange(new int[]{1}, 0)","expected":"0"},
             {"call":"Solution.coinChange(new int[]{1,5,10,25}, 30)","expected":"2"},
             {"call":"Solution.coinChange(new int[]{1,2,5}, 100)","expected":"20"},
             {"call":"Solution.coinChange(new int[]{2,5,10,1}, 27)","expected":"4"},
             {"call":"Solution.coinChange(new int[]{1}, 3)","expected":"3"},
             {"call":"Solution.coinChange(new int[]{2,4}, 5)","expected":"-1"}]
            """),
        problem("trapping-rain-water", "Trapping Rain Water", "HARD", "Arrays · Two Pointers",
            "public static int trap(int[] height)",
            "trap", TRAP_STARTER, TRAP_DESC,
            """
            [{"call":"Solution.trap(new int[]{0,1,0,2,1,0,1,3,2,1,2,1})","expected":"6"},
             {"call":"Solution.trap(new int[]{4,2,0,3,2,5})","expected":"9"}]
            """,
            """
            [{"call":"Solution.trap(new int[]{0,1,0,2,1,0,1,3,2,1,2,1})","expected":"6"},
             {"call":"Solution.trap(new int[]{4,2,0,3,2,5})","expected":"9"},
             {"call":"Solution.trap(new int[]{4,2,3})","expected":"1"},
             {"call":"Solution.trap(new int[]{3,0,0,2,0,4})","expected":"10"},
             {"call":"Solution.trap(new int[]{2,0,2})","expected":"2"},
             {"call":"Solution.trap(new int[]{5,0,0,0,5})","expected":"15"},
             {"call":"Solution.trap(new int[]{0})","expected":"0"}]
            """)
    );
}
