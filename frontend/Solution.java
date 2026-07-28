public class Solution{
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder("123");
        StringBuilder sb2 = new StringBuilder("111");

        int a = Integer.parseInt(String.valueOf(sb)) + Integer.parseInt(String.valueOf(sb2));
        System.out.println(a);
    }
}